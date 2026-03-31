import { ImageList, ImageListItem, Skeleton } from '@mui/material';
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FiChevronLeft, FiChevronRight, FiCompass, FiDownload, FiFolderPlus, FiShare2, FiEdit3 } from 'react-icons/fi';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import API_BASE_URL from '../../config/api.config';
import LazyLoadImage2 from '../LazyLoadImage2/LazyLoadImage2';
import CollectionSelectModal from '../CollectionSelectModal';
import { QueryErrorRetry } from '../QueryState/QueryState.jsx';
import { useAllImagesQuery, useCreatorImagesQuery, useCreatorsMapQuery } from '../../query/imageQueries.js';
import { getMediaVariantUrl } from '../../utils/mediaVariants.js';
import { trackAssetDownloadEvent } from '../../utils/downloadTracking.js';
import LikeBttnSm from '../LikeBttnSm/LikeBttnSm.jsx';
import AppFooter from '../AppFooter/AppFooter.jsx';
import './FilterationImages.css';

const normalizeLicenseValue = (value) => String(value || '').trim().toLowerCase();
const isPremiumByLicense = (value) => normalizeLicenseValue(value) === 'premium';
const COLLECTION_PAGE_SIZE = 16;

function FilterationMedia({ img, src, alt }) {
    const [videoDuration, setVideoDuration] = useState(null);
    const videoRef = useRef(null);

    const isVideoAsset = (
        img?.fileMetadata?.mimeType?.startsWith('video/')
        || img?.imagetype?.startsWith('video/')
        || /\.mp4$|\.mov$|\.m4v$|\.webm$/i.test(src || '')
    );

    const formatDuration = useCallback((durationSeconds) => {
        const total = Math.max(0, Math.floor(Number(durationSeconds) || 0));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, []);

    const durationLabel = useMemo(() => {
        const fromMeta = img?.fileMetadata?.duration;
        if (fromMeta != null && fromMeta !== '') return formatDuration(fromMeta);
        if (videoDuration != null) return formatDuration(videoDuration);
        return null;
    }, [img?.fileMetadata?.duration, videoDuration, formatDuration]);

    const handleMouseEnter = useCallback(() => {
        if (!isVideoAsset || !videoRef.current) return;
        const p = videoRef.current.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    }, [isVideoAsset]);

    const handleMouseLeave = useCallback(() => {
        if (!isVideoAsset || !videoRef.current) return;
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
    }, [isVideoAsset]);

    return (
        <div className="filteration-media-shell" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {isVideoAsset ? (
                <video
                    ref={videoRef}
                    src={src}
                    className="filteration-video-preview"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                        if (Number.isFinite(event?.currentTarget?.duration)) {
                            setVideoDuration(event.currentTarget.duration);
                        }
                    }}
                />
            ) : (
                <LazyLoadImage2
                    src={src}
                    alt={alt}
                    loading="lazy"
                />
            )}
            {isVideoAsset && durationLabel && (
                <div className="filteration-video-duration" aria-label={`Duration ${durationLabel}`}>
                    {durationLabel}
                </div>
            )}
        </div>
    );
}

function FilterationImages({
    name,
    presetSubcategory,
    creatorId = undefined,
    searchSubcategory = undefined,
    subSubcategoryNames = [],
    searchSubSubcategory = undefined,
    collectionAssetIds = undefined,   // NEW: limit to these asset IDs
    similarMatchMode = false,
    showFooter = false,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [activeSubcategory, setActiveSubcategory] = useState('all');
    const [activeSubsubcategory, setActiveSubsubcategory] = useState('all');
    const navigate = useNavigate();
    const location = useLocation();
    const { name: routeCollectionName, collectionPage: collectionPageParamRaw } = useParams();
    const [downloadTarget, setDownloadTarget] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const [showPillArrows, setShowPillArrows] = useState(false);
    const pillsRowRef = useRef(null);

    const isSearchMode = !!searchSubcategory;
    const parsedCollectionPage = Number.parseInt(collectionPageParamRaw || '1', 10);
    const currentPage = Number.isFinite(parsedCollectionPage) && parsedCollectionPage > 0 ? parsedCollectionPage : 1;

    const normalize = useCallback((val) => {
        if (typeof val === 'string') return val.trim().toLowerCase();
        if (val == null) return '';
        return String(val).trim().toLowerCase();
    }, []);

    const buildCollectionPagePath = useCallback((nextPage) => {
        const normalizedPage = Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1;
        const routeName = routeCollectionName || name || '';
        const encodedName = encodeURIComponent(routeName);
        const suffix = normalizedPage > 1 ? `/Page/${normalizedPage}` : '';
        return `/collection/${encodedName}${suffix}${location.search || ''}`;
    }, [location.search, name, routeCollectionName]);

    const getCategoryName = useCallback((cat) => {
        if (!cat) return '';
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object') return cat.name || '';
        return String(cat);
    }, []);

    const getSubcategoryName = useCallback((sub) => {
        if (!sub) return '';
        if (typeof sub === 'string') return sub;
        if (typeof sub === 'object') return sub.name || '';
        return String(sub);
    }, []);

    const getSubSubcategoryName = useCallback((subsub) => {
        if (!subsub) return '';
        if (typeof subsub === 'string') return subsub;
        if (typeof subsub === 'object') return subsub.name || '';
        return String(subsub);
    }, []);

    const getCreatorName = useCallback((creator) => {
        if (!creator) return '';
        return (
            creator.profile?.displayName ||
            creator.displayName ||
            creator.name ||
            ''
        );
    }, []);

    const slugify = useCallback(
        (val) => {
            const base = normalize(val || '');
            if (!base) return '';
            return base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        },
        [normalize]
    );

    const getExtensionFromUrl = useCallback((url) => {
        if (!url) return '';
        try {
            const u = new URL(url);
            const pathname = u.pathname || '';
            const dotIndex = pathname.lastIndexOf('.');
            if (dotIndex === -1) return '';
            return pathname.substring(dotIndex);
        } catch {
            const qIndex = url.indexOf('?');
            const clean = qIndex === -1 ? url : url.slice(0, qIndex);
            const dotIndex = clean.lastIndexOf('.');
            if (dotIndex === -1) return '';
            return clean.substring(dotIndex);
        }
    }, []);

    const allImagesQuery = useAllImagesQuery(!creatorId);
    const creatorImagesQuery = useCreatorImagesQuery(creatorId, Boolean(creatorId));
    const sourceImages = useMemo(
        () => (creatorId ? (creatorImagesQuery.data || []) : (allImagesQuery.data || [])),
        [creatorId, creatorImagesQuery.data, allImagesQuery.data]
    );
    const sourceLoading = creatorId ? creatorImagesQuery.isLoading : allImagesQuery.isLoading;
    const sourceError = creatorId ? creatorImagesQuery.error : allImagesQuery.error;

    const imagesdata = useMemo(() => {
        const approved = sourceImages.filter((item) => item.approved === true && item.rejected !== true);

        let base = approved;
        if (Array.isArray(collectionAssetIds) && collectionAssetIds.length) {
            const idSet = new Set(collectionAssetIds.map(String));
            base = approved.filter((item) => idSet.has(String(item._id)));
        }

        let filtered = name
            ? base.filter((item) => normalize(getCategoryName(item.category)) === normalize(name))
            : base;

        if (similarMatchMode) {
            const targetSub = normalize(searchSubcategory || '');
            const targetSubSub = normalize(searchSubSubcategory || '');

            if (targetSub && targetSubSub) {
                const level3 = filtered.filter(
                    (item) =>
                        normalize(getSubcategoryName(item.subcategory)) === targetSub &&
                        normalize(getSubSubcategoryName(item.subsubcategory)) === targetSubSub
                );
                if (level3.length) {
                    filtered = level3;
                } else {
                    const level2 = filtered.filter(
                        (item) => normalize(getSubcategoryName(item.subcategory)) === targetSub
                    );
                    if (level2.length) filtered = level2;
                }
            } else if (targetSub) {
                filtered = filtered.filter(
                    (item) => normalize(getSubcategoryName(item.subcategory)) === targetSub
                );
            } else if (targetSubSub) {
                filtered = filtered.filter(
                    (item) => normalize(getSubSubcategoryName(item.subsubcategory)) === targetSubSub
                );
            }
        } else {
            if (searchSubcategory) {
                const targetSub = normalize(searchSubcategory);
                filtered = filtered.filter(
                    (item) => normalize(getSubcategoryName(item.subcategory)) === targetSub
                );
            }

            if (searchSubSubcategory) {
                const targetSubSub = normalize(searchSubSubcategory);
                filtered = filtered.filter(
                    (item) => normalize(getSubSubcategoryName(item.subsubcategory)) === targetSubSub
                );
            }
        }

        return [...filtered].sort(
            (a, b) =>
                new Date(b.createdAt || b.fileMetadata?.uploadedAt || 0) -
                new Date(a.createdAt || a.fileMetadata?.uploadedAt || 0)
        );
    }, [sourceImages, collectionAssetIds, name, normalize, getCategoryName, similarMatchMode, searchSubcategory, searchSubSubcategory, getSubcategoryName, getSubSubcategoryName]);

    const creatorIds = useMemo(() => {
        return Array.from(
            new Set(
                imagesdata
                    .map((img) => img.creatorId && (img.creatorId.$oid || img.creatorId))
                    .filter(Boolean)
                    .map(String)
            )
        );
    }, [imagesdata]);

    const creatorsMapQuery = useCreatorsMapQuery(creatorIds);
    const creatorData = creatorsMapQuery.data || {};
    const loading = sourceLoading || creatorsMapQuery.isLoading;
    const queryErrorMessage = sourceError?.response?.data?.message || sourceError?.message || '';

    const subcategories = useMemo(() => {
        const set = new Set();
        imagesdata.forEach((img) => {
            if (normalize(getCategoryName(img.category)) === normalize(name)) {
                const subName = getSubcategoryName(img.subcategory);
                if (subName) set.add(subName.trim());
            }
        });
        return Array.from(set);
    }, [imagesdata, name, normalize, getCategoryName, getSubcategoryName]);

    const subSubcategoriesForSearch = useMemo(() => {
        if (!isSearchMode) return [];
        if (Array.isArray(subSubcategoryNames) && subSubcategoryNames.length) {
            return subSubcategoryNames;
        }
        const set = new Set();
        const targetSub = normalize(searchSubcategory || '');
        imagesdata.forEach((img) => {
            if (normalize(getSubcategoryName(img.subcategory)) !== targetSub) return;
            const subSubName = getSubSubcategoryName(img.subsubcategory);
            if (subSubName) set.add(subSubName.trim());
        });
        return Array.from(set);
    }, [isSearchMode, subSubcategoryNames, imagesdata, searchSubcategory, normalize, getSubcategoryName, getSubSubcategoryName]);

    useEffect(() => {
        setActiveSubcategory('all');
        setActiveSubsubcategory('all');
    }, [name, searchSubcategory, searchSubSubcategory, creatorId, collectionAssetIds, similarMatchMode]);

    useEffect(() => {
        if (presetSubcategory === undefined || presetSubcategory === null) return;
        if (presetSubcategory === 'all') {
            setActiveSubcategory('all');
            setActiveSubsubcategory('all');
        } else {
            setActiveSubcategory(presetSubcategory);
            setActiveSubsubcategory('all');
        }
    }, [presetSubcategory]);

    const gridColumns = isMobile ? 2 : (isTablet ? 3 : 4);
    const gridGap = isMobile ? 10 : 8;
    const gridVariant = isMobile ? 'standard' : 'masonry';

    // Build SEO-friendly URL: /asset/:categorySlug/:subSlug/:id
    const buildAssetUrl = useCallback(
        (img) => {
            const categorySlug = slugify(getCategoryName(img.category)) || 'image';
            const subSlug = slugify(getSubcategoryName(img.subcategory)) || 'all';
            const id = img._id;
            return `/asset/${categorySlug}/${subSlug}/${id}`;
        },
        [slugify, getCategoryName, getSubcategoryName]
    );

    const handleImageClick = useCallback(
        (img) => {
            if (!img?._id) return;
            navigate(buildAssetUrl(img));
        },
        [navigate, buildAssetUrl]
    );

    const handleDiscoverSimilar = useCallback((event, img) => {
        event.stopPropagation();
        const catName = getCategoryName(img?.category);
        if (!catName) return;
        const subName = getSubcategoryName(img?.subcategory);
        const subSubName = getSubSubcategoryName(img?.subsubcategory);
        const params = new URLSearchParams();
        params.set('discover', '1');
        if (subName) params.set('dsSub', subName);
        if (subSubName) params.set('dsSubSub', subSubName);
        navigate(`/collection/${encodeURIComponent(normalize(catName))}?${params.toString()}`);
    }, [navigate, normalize, getCategoryName, getSubcategoryName, getSubSubcategoryName]);

    const handleShare = useCallback(async (event, img) => {
        event.stopPropagation();
        const detailUrl = img?._id
            ? `${window.location.origin}${buildAssetUrl(img)}`
            : img?.imageUrl || window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: img?.title || 'Asset', url: detailUrl });
                return;
            }
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(detailUrl);
                alert('Link copied to clipboard');
                return;
            }
            window.prompt('Copy link', detailUrl);
        } catch (err) {
            console.error('Share failed', err);
        }
    }, [buildAssetUrl]);

    const handleEdit = useCallback((event, img) => {
        event.stopPropagation();
        if (!img?._id) return;
        const params = new URLSearchParams();
        params.set('assetId', img._id);
        if (img.imageUrl) params.set('assetUrl', img.imageUrl);
        if (img.title) params.set('title', img.title);
        navigate(`/design-hdpiks?${params.toString()}`);
    }, [navigate]);
    const handleEditAsset = useCallback((img) => {
        if (!img?._id) return;
        const params = new URLSearchParams();
        params.set('assetId', img._id);
        if (img.imageUrl) params.set('assetUrl', img.imageUrl);
        if (img.title) params.set('title', img.title);
        navigate(`/design-hdpiks?${params.toString()}`);
    }, [navigate]);

    // NEW: build ordered list of variants for an image
    const getVariantsForImage = useCallback((img) => {
        if (!img) return [];
        const variants = Array.isArray(img.mediaVariants) ? [...img.mediaVariants] : [];

        // Fallback: only original is available
        if (!variants.length && img.imageUrl) {
            variants.push({
                variant: 'original',
                url: img.imageUrl,
                s3Key: img.s3Key || null,
                dimensions: {
                    width: img.fileMetadata?.dimensions?.width || null,
                    height: img.fileMetadata?.dimensions?.height || null,
                },
                fileSize: img.fileMetadata?.fileSize || null,
            });
        }

        const order = ['thumbnail', 'small', 'medium', 'large', 'original'];
        variants.sort((a, b) => {
            const ai = order.indexOf(a.variant);
            const bi = order.indexOf(b.variant);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });

        return variants;
    }, []);

    // CHANGE: open modal instead of downloading immediately
    const handleDownload = useCallback((event, img) => {
        event.stopPropagation();
        if (!img) return;
        if (isPremiumByLicense(img?.freePremium)) {
            navigate(buildAssetUrl(img));
            return;
        }
        setDownloadTarget(img);
        setShowDownloadModal(true);
    }, [navigate, buildAssetUrl]);

    // NEW: download the selected variant via backend proxy
    const handleVariantDownload = useCallback(async (variant, img) => {
        if (!variant || !variant.url) return;

        try {
            const label = variant.variant
                ? variant.variant.charAt(0).toUpperCase() + variant.variant.slice(1)
                : 'Original';

            const w = variant.dimensions?.width;
            const h = variant.dimensions?.height;
            const sizeSuffix = w && h ? `-${w}x${h}px` : '';
            const baseTitle = (img.title || 'asset').toString().replace(/[^\w.-]+/g, '-');
            const ext = getExtensionFromUrl(variant.url) || '';
            const fileName = `${baseTitle}-${label}${sizeSuffix}${ext}`;

            let href = variant.url;
            const tracked = await trackAssetDownloadEvent({
                assetId: img?._id,
                fileName,
            });

            if (tracked?.downloadUrl) {
                href = tracked.downloadUrl;
            } else if (variant.s3Key) {
                const params = new URLSearchParams();
                params.set('key', variant.s3Key);
                params.set('filename', fileName);
                href = `${API_BASE_URL}/download?${params.toString()}`;
            }

            const link = document.createElement('a');
            link.href = href;
            link.download = fileName;
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            link.remove();

            setShowDownloadModal(false);
            setDownloadTarget(null);
        } catch (error) {
            console.error('Error downloading asset variant:', error);
            alert(error?.message || 'Error downloading file');
        }
    }, [getExtensionFromUrl]);

    const handleSaveToCollection = useCallback((event, img) => {
        event.stopPropagation();
        if (!img?._id) return;

        const token = Cookies.get('token');
        if (!token) {
            alert('Please login to save assets to a collection.');
            navigate('/login');
            return;
        }

        setSelectedAssetId(img._id);
        setShowCollectionModal(true);
    }, [navigate]);

    const handleCloseCollectionModal = useCallback(() => {
        setShowCollectionModal(false);
        setSelectedAssetId(null);
    }, []);

    const skeletonCount = imagesdata.length > 0 ? imagesdata.length : 6;

    const subcategoryBuckets = useMemo(() => {
        const buckets = {};
        imagesdata.forEach((item) => {
            const sub = getSubcategoryName(item.subcategory)?.trim() || 'Uncategorized';
            const subsub = getSubSubcategoryName(item.subsubcategory)?.trim();
            if (!buckets[sub]) {
                buckets[sub] = { items: [], subsubs: new Set() };
            }
            buckets[sub].items.push(item);
            if (subsub) buckets[sub].subsubs.add(subsub);
        });
        return buckets;
    }, [imagesdata, getSubcategoryName, getSubSubcategoryName]);

    const filteredGroups = useMemo(() => {
        const groups = [];
        Object.entries(subcategoryBuckets).forEach(([sub, bucket]) => {
            if (activeSubcategory !== 'all' && sub !== activeSubcategory) return;
            const scopedItems = bucket.items.filter((item) => {
                if (activeSubsubcategory !== 'all') {
                    return getSubSubcategoryName(item.subsubcategory).trim() === activeSubsubcategory;
                }
                return true;
            });
            if (scopedItems.length) {
                groups.push([sub, scopedItems]);
            }
        });
        return groups;
    }, [subcategoryBuckets, activeSubcategory, activeSubsubcategory, getSubSubcategoryName]);

    const visibleGroups = useMemo(() => {
        return filteredGroups.map(([subcat, items]) => ({
            key: subcat,
            title: isSearchMode && searchSubSubcategory ? searchSubSubcategory : subcat,
            items,
        }));
    }, [filteredGroups, isSearchMode, searchSubSubcategory]);

    const paginatedEntries = useMemo(() => {
        return visibleGroups.flatMap((group) =>
            group.items.map((img) => ({
                groupKey: group.key,
                sectionTitle: group.title,
                img,
            }))
        );
    }, [visibleGroups]);

    const totalPaginatedItems = paginatedEntries.length;
    const totalPages = Math.max(1, Math.ceil(totalPaginatedItems / COLLECTION_PAGE_SIZE));

    const pagedEntries = useMemo(() => {
        const startIndex = (currentPage - 1) * COLLECTION_PAGE_SIZE;
        return paginatedEntries.slice(startIndex, startIndex + COLLECTION_PAGE_SIZE);
    }, [currentPage, paginatedEntries]);

    const paginatedGroups = useMemo(() => {
        const groups = [];
        pagedEntries.forEach(({ groupKey, sectionTitle, img }) => {
            const lastGroup = groups[groups.length - 1];
            if (!lastGroup || lastGroup.key !== groupKey) {
                groups.push({ key: groupKey, title: sectionTitle, items: [img] });
            } else {
                lastGroup.items.push(img);
            }
        });
        return groups;
    }, [pagedEntries]);

    const visiblePages = useMemo(() => {
        const total = Math.max(1, totalPages);
        const pages = new Set([1, total, currentPage, currentPage - 1, currentPage + 1]);
        return Array.from(pages)
            .filter((page) => page >= 1 && page <= total)
            .sort((a, b) => a - b);
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (!loading) {
            const subcategoryBuckets = {};
            imagesdata.forEach((item) => {
                const sub = getSubcategoryName(item.subcategory)?.trim() || 'Uncategorized';
                if (!subcategoryBuckets[sub]) subcategoryBuckets[sub] = [];
                subcategoryBuckets[sub].push(item);
            });
            console.log('[FilterationImages] Subcategory Buckets:', subcategoryBuckets);
        }
    }, [imagesdata, loading, getSubcategoryName]);

    useEffect(() => {
        if (currentPage <= totalPages) return;
        navigate(buildCollectionPagePath(totalPages), { replace: true });
    }, [buildCollectionPagePath, currentPage, navigate, totalPages]);

    const handlePageChange = useCallback((page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        navigate(buildCollectionPagePath(page));
        const sectionTop = document.querySelector('.filteration-page-container');
        if (sectionTop) {
            sectionTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [buildCollectionPagePath, currentPage, navigate, totalPages]);

    // NEW: handle subcategory pill click
    const handleSubcategoryPillClick = useCallback(
        (subcat) => {
            if (isSearchMode) {
                // In search context: reset to that subcategory (show all wallpapers, etc.)
                navigate(`/search/${encodeURIComponent(subcat)}`);
            } else {
                // In normal category page: local filter by subcategory
                setActiveSubcategory(subcat);
                setActiveSubsubcategory('all');
                if (currentPage !== 1) {
                    navigate(buildCollectionPagePath(1));
                }
            }
        },
        [buildCollectionPagePath, currentPage, isSearchMode, navigate]
    );

    const scrollPills = useCallback((direction) => {
        const row = pillsRowRef.current;
        if (!row) return;
        const step = Math.max(120, Math.floor(row.clientWidth * 0.6));
        row.scrollBy({ left: direction * step, behavior: 'smooth' });
    }, []);

    const updatePillArrowVisibility = useCallback(() => {
        const row = pillsRowRef.current;
        if (!row || !isMobile) {
            setShowPillArrows(false);
            return;
        }
        const overflowed = row.scrollWidth > row.clientWidth + 2;
        setShowPillArrows(overflowed);
    }, [isMobile]);

    useEffect(() => {
        updatePillArrowVisibility();
        window.addEventListener('resize', updatePillArrowVisibility);
        return () => window.removeEventListener('resize', updatePillArrowVisibility);
    }, [
        updatePillArrowVisibility,
        subcategories,
        activeSubcategory,
        isSearchMode,
        name,
        imagesdata.length,
    ]);

    // NEW: shared styles for subcategory pills
    const pillBaseStyle = {
        borderRadius: 999,
        fontSize: 13,
        padding: '6px 18px',
        border: '1px solid #020617',
        backgroundColor: '#020617',
        color: '#ffffff',
    };
    const pillActiveStyle = {
        borderRadius: 999,
        fontSize: 13,
        padding: '6px 18px',
        background: 'linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))',
        color: '#ffffff',
        border: '1px solid rgb(143, 92, 255)',
        boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
    };

    return (
        <>
        <div className="container filteration-page-container">
            {/* Row 1: category + subcategory pills */}
            <div className="filteration-pill-shell mb-3">
                {showPillArrows ? (
                    <button
                        type="button"
                        className="filteration-pill-arrow filteration-pill-arrow-left"
                        onClick={() => scrollPills(-1)}
                        aria-label="Scroll categories left"
                    >
                        <FiChevronLeft size={16} />
                    </button>
                ) : null}

                <div
                    ref={pillsRowRef}
                    className={`filteration-pill-row d-flex flex-wrap align-items-center gap-2 justify-content-center justify-content-md-start ${showPillArrows ? 'filteration-pill-row--with-arrows' : ''}`}
                    style={{ background: '#f7f3ff', borderRadius: 999, padding: '6px 10px' }}
                >
                <span
                    className="fw-bold px-3 py-1 text-white"
                    style={{
                        background: 'linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))',
                        borderRadius: 999,
                        fontSize: 13,
                        border: '1px solid rgb(143, 92, 255)',
                    }}
                >
                    {`Category/${name ? name.charAt(0).toUpperCase() + name.slice(1) : 'All'}`}
                </span>

                {!isSearchMode && (
                    <button
                        className="btn btn-sm"
                        style={activeSubcategory === 'all' ? pillActiveStyle : pillBaseStyle}
                        onClick={() => { setActiveSubcategory('all'); setActiveSubsubcategory('all'); if (currentPage !== 1) navigate(buildCollectionPagePath(1)); }}
                    >
                        All
                    </button>
                )}

                {subcategories.length === 0 && (
                    <span className="text-muted" style={{ fontSize: '13px' }}>
                        No subcategories available
                    </span>
                )}
                {subcategories.map((subcat) => (
                    <button
                        key={subcat}
                        className="btn btn-sm"
                        style={activeSubcategory === subcat ? pillActiveStyle : pillBaseStyle}
                        onClick={() => handleSubcategoryPillClick(subcat)}
                    >
                        {subcat}
                    </button>
                ))}
                </div>

                {showPillArrows ? (
                    <button
                        type="button"
                        className="filteration-pill-arrow filteration-pill-arrow-right"
                        onClick={() => scrollPills(1)}
                        aria-label="Scroll categories right"
                    >
                        <FiChevronRight size={16} />
                    </button>
                ) : null}
            </div>

            {loading ? (
                <ImageList
                    className="filteration-grid"
                    sx={{ width: '100%', height: 'auto' }}
                    variant={gridVariant}
                    cols={gridColumns}
                    gap={gridGap}
                >
                    {[...Array(skeletonCount)].map((_, index) => (
                        <ImageListItem key={index}>
                            <Skeleton variant="rectangular" width="100%" height={isMobile ? 140 : 200} />
                        </ImageListItem>
                    ))}
                </ImageList>
            ) : queryErrorMessage ? (
                <QueryErrorRetry
                    message={queryErrorMessage}
                    onRetry={() => {
                        if (creatorId) creatorImagesQuery.refetch();
                        else allImagesQuery.refetch();
                        creatorsMapQuery.refetch();
                    }}
                />
            ) : totalPaginatedItems === 0 ? (
                <p className="text-capitalize">No data found yet</p>
            ) : (
                <>
                    {paginatedGroups.map(({ key: subcat, title: sectionTitle, items }) => (
                                <div key={subcat} className="mb-4 w-100">
                                    <h5 className="fw-semibold mb-2 text-capitalize filteration-section-title">{sectionTitle}</h5>
                                    <ImageList
                                        className="filteration-grid"
                                        sx={{ width: '100%', height: 'auto' }}
                                        variant={gridVariant}
                                        cols={gridColumns}
                                        gap={gridGap}
                                    >
                                        {items.map((img) => {
                                            const imgCreatorId =
                                                img.creatorId && (img.creatorId.$oid || img.creatorId);
                                            const creator = imgCreatorId
                                                ? creatorData[String(imgCreatorId)]
                                                : undefined;
                                            const creatorName = getCreatorName(creator);
                                            return (
                                                <ImageListItem key={img._id} onClick={() => handleImageClick(img)}>
                                                    <div className="card card-container rounded-4">
                                                        <FilterationMedia
                                                            img={img}
                                                            src={getMediaVariantUrl(img, ['small', 'medium', 'thumbnail', 'large', 'original'])}
                                                            alt={
                                                                getSubcategoryName(img.subcategory) ||
                                                                getCategoryName(img.category) ||
                                                                getSubSubcategoryName(img.subsubcategory)
                                                            }
                                                        />
                                                        <span
                                                            className={`filteration-license-tag ${isPremiumByLicense(img?.freePremium) ? 'filteration-license-tag--premium' : 'filteration-license-tag--free'}`}
                                                        >
                                                            {isPremiumByLicense(img?.freePremium) ? 'Premium' : 'Free'}
                                                        </span>
                                                        <div className="card-img-overlay rounded-4 content-hide d-flex flex-column justify-content-end">
                                                            <div className="filteration-actions">
                                                                <button
                                                                    type="button"
                                                                    className="filteration-action-btn"
                                                                    title="Edit image"
                                                                    onClick={(e) => handleEdit(e, img)}
                                                                >
                                                                    <FiEdit3 size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="filteration-action-btn"
                                                                    title="Discover similar"
                                                                    onClick={(e) => handleDiscoverSimilar(e, img)}
                                                                >
                                                                    <FiCompass size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="filteration-action-btn"
                                                                    title="Save to collection"
                                                                    onClick={(e) => handleSaveToCollection(e, img)}
                                                                >
                                                                    <FiFolderPlus size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="filteration-action-btn"
                                                                    title="Share"
                                                                    onClick={(e) => handleShare(e, img)}
                                                                >
                                                                    <FiShare2 size={16} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="filteration-action-btn"
                                                                    title="Download"
                                                                    onClick={(e) => handleDownload(e, img)}
                                                                >
                                                                    <FiDownload size={16} />
                                                                </button>
                                                                <LikeBttnSm imgId={img?._id} compact stopPropagation />
                                                            </div>
                                                            <h5
                                                                className="mb-1 text-white fw-semibold"
                                                                style={{ fontSize: '15px' }}
                                                            >
                                                                {getSubcategoryName(img.subcategory) ||
                                                                    getCategoryName(img.category) ||
                                                                    getSubSubcategoryName(img.subsubcategory)}
                                                            </h5>
                                                            {img.subsubcategory && (
                                                                <span
                                                                    className="badge bg-light text-dark mb-2"
                                                                    style={{ width: 'fit-content' }}
                                                                >
                                                                    {getSubSubcategoryName(img.subsubcategory)}
                                                                </span>
                                                            )}
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    {creatorName ? (
                                                                        <span
                                                                            className="mb-0 me-2 text-white fw-bold"
                                                                            style={{ fontSize: '14px' }}
                                                                        >
                                                                            {creatorName}
                                                                        </span>
                                                                    ) : (
                                                                        <span
                                                                            className="mb-0 me-2 text-white"
                                                                            style={{ fontSize: '14px' }}
                                                                        >
                                                                            Unknown Creator
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ImageListItem>
                                            );
                                        })}
                                    </ImageList>
                                </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap mt-4">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || loading}
                            >
                                Prev
                            </button>
                            {visiblePages.map((page, index) => {
                                const previous = visiblePages[index - 1];
                                const showGap = index > 0 && previous && page - previous > 1;
                                return (
                                    <React.Fragment key={page}>
                                        {showGap && <span className="text-muted px-1">...</span>}
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${currentPage === page ? 'btn-dark' : 'btn-outline-dark'}`}
                                            onClick={() => handlePageChange(page)}
                                            disabled={loading}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages || loading}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {showDownloadModal && downloadTarget && (
                <div
                    className="download-modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1050,
                    }}
                    onClick={() => {
                        setShowDownloadModal(false);
                        setDownloadTarget(null);
                    }}
                    >
                        <div
                            className="download-modal"
                            style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: '16px 20px',
                            minWidth: 260,
                            maxWidth: 320,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mb-2 w-100"
                                onClick={() => {
                                    handleEditAsset(downloadTarget);
                                    setShowDownloadModal(false);
                                    setDownloadTarget(null);
                                }}
                            >
                                Edit with HDPiks
                            </button>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#555' }}>
                                FILE SIZE
                            </div>
                        {getVariantsForImage(downloadTarget).map((v) => {
                            const label = v.variant.charAt(0).toUpperCase() + v.variant.slice(1);
                            const w = v.dimensions?.width;
                            const h = v.dimensions?.height;
                            const sizeLabel = w && h ? `${w} × ${h}px` : '';
                            return (
                                <button
                                    key={v._id?.$oid || v.s3Key || v.variant}
                                    type="button"
                                    onClick={() => handleVariantDownload(v, downloadTarget)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '6px 0',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 13,
                                    }}
                                >
                                    <span>{label}</span>
                                    <span style={{ color: '#666' }}>{sizeLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <CollectionSelectModal
                show={showCollectionModal}
                onClose={handleCloseCollectionModal}
                assetId={selectedAssetId}
                onSuccess={() => {}}
            />
        </div>
        {showFooter ? (
            <div className="filteration-page-footer">
                <AppFooter />
            </div>
        ) : null}
        </>
    );
}

export default React.memo(FilterationImages);










