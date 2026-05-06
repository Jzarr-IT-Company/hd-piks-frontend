import { ImageList, ImageListItem, Skeleton } from '@mui/material';
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FiChevronLeft, FiChevronRight, FiCompass, FiDownload, FiFolderPlus, FiShare2, FiEdit3, FiZap } from 'react-icons/fi';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import API_BASE_URL from '../../config/api.config';
import LazyLoadImage2 from '../LazyLoadImage2/LazyLoadImage2';
import CollectionSelectModal from '../CollectionSelectModal';
import { QueryErrorRetry } from '../QueryState/QueryState.jsx';
import { useAllImagesQuery, useCreatorImagesQuery, useCreatorsMapQuery } from '../../query/imageQueries.js';
import { useAssetLikeStatusBatchQuery } from '../../query/likeQueries.js';
import { getMediaVariantUrl } from '../../utils/mediaVariants.js';
import { trackAssetDownloadEvent } from '../../utils/downloadTracking.js';
import { usePublicCategoriesQuery } from '../../query/categoryQueries.js';
import { getAssetDisplayName, getAssetDownloadBaseName, getAssetUrlSlug } from '../../utils/assetName.js';
import {
    useCollectionAssetsQuery,
    useCollectionNavigationQuery,
    SUBCATEGORY_SLICE_LIMIT,
    SUGGESTED_STYLE_SLICE_LIMIT,
} from '../../query/collectionBootstrapQueries.js';
import {
    DEFAULT_SUGGESTED_ICON_BG,
    DEFAULT_SUGGESTED_ICON_COLOR,
    DEFAULT_SUGGESTED_STYLE_ICON,
    getSuggestedStyleIcon,
    recommendSuggestedStyleIcon,
} from '../../utils/suggestedStyleIcons.js';
import LikeBttnSm from '../LikeBttnSm/LikeBttnSm.jsx';
import { useAuth } from '../../Context/AuthContext.jsx';
import AppFooter from '../AppFooter/AppFooter.jsx';
import watermarkLogo from '../../assets/watermark-logo.png';
import './FilterationImages.css';

const normalizeLicenseValue = (value) => String(value || '').trim().toLowerCase();
const isPremiumByLicense = (value) => normalizeLicenseValue(value) === 'premium';
const COLLECTION_PAGE_SIZE = 16;
const slugifyCollectionSegment = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const getBrowseMediaUrl = (asset) => {
    const mime = String(asset?.fileMetadata?.mimeType || asset?.imagetype || '').toLowerCase();
    const fallback = asset?.imageUrl || asset?.s3Url || asset?.imageData?.[0]?.url || '';
    if (mime.startsWith('video/') || /\\.mp4$|\\.mov$|\\.m4v$|\\.webm$/i.test(fallback)) {
        return getMediaVariantUrl(asset, ['360p', '720p', '1080p', 'original']) || fallback;
    }
    return getMediaVariantUrl(asset, ['thumbnail', 'small', 'medium', 'large', 'original']) || fallback;
};

function FilterationMedia({ img, src, alt, priority = false }) {
    const [videoDuration, setVideoDuration] = useState(null);
    const videoRef = useRef(null);

    const isVideoAsset = (
        img?.fileMetadata?.mimeType?.startsWith('video/')
        || img?.imagetype?.startsWith('video/')
        || /\.mp4$|\.mov$|\.m4v$|\.webm$/i.test(src || '')
    );
    const isPremiumAsset = isPremiumByLicense(img?.freePremium);

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
                    priority={priority}
                />
            )}
            {isVideoAsset && durationLabel && (
                <div className="filteration-video-duration" aria-label={`Duration ${durationLabel}`}>
                    {durationLabel}
                </div>
            )}
            {isPremiumAsset && (
                <img
                    src={watermarkLogo}
                    alt=""
                    aria-hidden="true"
                    className="filteration-watermark-overlay"
                    loading="eager"
                    draggable="false"
                />
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
    presetSubSubcategory = 'all',
    collectionAssetIds = undefined,   // NEW: limit to these asset IDs
    providedImages = undefined,
    providedTotal = undefined,
    similarMatchMode = false,
    showFooter = false,
}) {
    const theme = useTheme();
    const { isLoggedIn } = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [activeSubcategory, setActiveSubcategory] = useState('all');
    const [activeSubsubcategory, setActiveSubsubcategory] = useState('all');
    const navigate = useNavigate();
    const location = useLocation();
    const { name: routeCollectionName, parentSlug, collectionPage: collectionPageParamRaw } = useParams();
    const [downloadTarget, setDownloadTarget] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const [showPillArrows, setShowPillArrows] = useState(false);
    const [showSuggestedArrows, setShowSuggestedArrows] = useState(false);
    const [subcategoryOffset, setSubcategoryOffset] = useState(0);
    const [suggestedOffset, setSuggestedOffset] = useState(0);
    const pillsRowRef = useRef(null);
    const suggestedRowRef = useRef(null);
    const categoriesQuery = usePublicCategoriesQuery();

    const isSearchMode = !!searchSubcategory;
    const useProvidedImagesMode = Array.isArray(providedImages);
    const useBootstrapMode = !creatorId && !isSearchMode && !collectionAssetIds && !useProvidedImagesMode && Boolean(name);
    const parsedCollectionPage = Number.parseInt(collectionPageParamRaw || '1', 10);
    const currentPage = Number.isFinite(parsedCollectionPage) && parsedCollectionPage > 0 ? parsedCollectionPage : 1;

    const normalize = useCallback((val) => {
        if (typeof val === 'string') return val.trim().toLowerCase();
        if (val == null) return '';
        return String(val).trim().toLowerCase();
    }, []);

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

    const buildCollectionPath = useCallback(
        ({
            subcategory = activeSubcategory,
            subsubcategory = activeSubsubcategory,
            page = 1,
            includeSearch = true,
        } = {}) => {
            const normalizedPage = Number.isFinite(page) && page > 0 ? page : 1;
            const categorySlug = slugifyCollectionSegment(parentSlug || routeCollectionName || name || 'image') || 'image';
            const subcategorySlug = subcategory && subcategory !== 'all' ? slugifyCollectionSegment(subcategory) : '';
            const subsubcategorySlug = subcategorySlug && subsubcategory && subsubcategory !== 'all'
                ? slugifyCollectionSegment(subsubcategory)
                : '';
            const segments = ['/collection', categorySlug];

            if (subcategorySlug) segments.push(subcategorySlug);
            if (subsubcategorySlug) segments.push(subsubcategorySlug);
            if (normalizedPage > 1) segments.push('Page', String(normalizedPage));

            return `${segments.join('/')}${includeSearch ? (location.search || '') : ''}`;
        },
        [activeSubcategory, activeSubsubcategory, location.search, name, parentSlug, routeCollectionName]
    );

    const buildCollectionPagePath = useCallback(
        (nextPage) => buildCollectionPath({ page: nextPage }),
        [buildCollectionPath]
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

    const collectionNavigationQuery = useCollectionNavigationQuery({
        parentCategory: name,
        subcategory: activeSubcategory,
        enabled: useBootstrapMode,
    });
    const collectionAssetsQuery = useCollectionAssetsQuery({
        parentCategory: name,
        subcategory: activeSubcategory,
        subsubcategory: activeSubsubcategory,
        page: currentPage,
        enabled: useBootstrapMode,
    });

    const bootstrapData = collectionNavigationQuery.data || null;
    const bootstrapAssets = collectionAssetsQuery.data || null;
    const bootstrapSubcategories = bootstrapData?.subcategories || null;
    const bootstrapSuggestedStyles = bootstrapData?.suggestedStyles || null;

    const allImagesQuery = useAllImagesQuery(
        !creatorId && Boolean(name) && !useBootstrapMode && !useProvidedImagesMode,
        name,
        activeSubcategory !== 'all' ? activeSubcategory : ''
    );
    const creatorImagesQuery = useCreatorImagesQuery(creatorId, Boolean(creatorId));
    const sourceImages = useMemo(
        () => {
            if (useProvidedImagesMode) return providedImages || [];
            if (useBootstrapMode) return bootstrapAssets?.items || [];
            return creatorId ? (creatorImagesQuery.data || []) : (allImagesQuery.data || []);
        },
        [useProvidedImagesMode, providedImages, useBootstrapMode, bootstrapAssets?.items, creatorId, creatorImagesQuery.data, allImagesQuery.data]
    );
    const sourceLoading = useBootstrapMode
        ? (collectionNavigationQuery.isLoading || collectionAssetsQuery.isLoading)
        : (useProvidedImagesMode ? false : (creatorId ? creatorImagesQuery.isLoading : allImagesQuery.isLoading));
    const sourceError = useBootstrapMode
        ? (collectionAssetsQuery.error || collectionNavigationQuery.error)
        : (useProvidedImagesMode ? null : (creatorId ? creatorImagesQuery.error : allImagesQuery.error));

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

    const taxonomySubcategoryMap = useMemo(() => {
        const tree = categoriesQuery.data;
        if (!Array.isArray(tree) || !tree.length || !name) return new Map();
        const parent = tree.find((item) => normalize(item?.name) === normalize(name));
        const map = new Map();
        (parent?.children || []).forEach((subcat) => {
            const subName = getSubcategoryName(subcat);
            if (subName) map.set(normalize(subName), subcat);
        });
        return map;
    }, [categoriesQuery.data, getSubcategoryName, name, normalize]);

    const subcategories = useMemo(() => {
        if (useBootstrapMode) {
            return (bootstrapSubcategories?.items || [])
                .map((subcat) => getSubcategoryName(subcat))
                .filter(Boolean)
                .slice(subcategoryOffset, subcategoryOffset + SUBCATEGORY_SLICE_LIMIT);
        }

        if (taxonomySubcategoryMap.size && !useProvidedImagesMode) {
            return Array.from(taxonomySubcategoryMap.values())
                .map((subcat) => getSubcategoryName(subcat))
                .filter(Boolean);
        }

        const set = new Set();
        imagesdata.forEach((img) => {
            if (normalize(getCategoryName(img.category)) === normalize(name)) {
                const subName = getSubcategoryName(img.subcategory);
                if (subName) set.add(subName.trim());
            }
        });
        return Array.from(set);
    }, [useBootstrapMode, bootstrapSubcategories?.items, subcategoryOffset, taxonomySubcategoryMap, useProvidedImagesMode, imagesdata, name, normalize, getCategoryName, getSubcategoryName]);

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
        setSubcategoryOffset(0);
        setSuggestedOffset(0);
    }, [name, searchSubcategory, searchSubSubcategory, creatorId, collectionAssetIds, similarMatchMode]);

    useEffect(() => {
        if (presetSubcategory === undefined || presetSubcategory === null) return;
        if (presetSubcategory === 'all') {
            setActiveSubcategory('all');
            setActiveSubsubcategory('all');
            setSuggestedOffset(0);
        } else {
            setActiveSubcategory(presetSubcategory);
            setActiveSubsubcategory(
                presetSubSubcategory && presetSubSubcategory !== 'all'
                    ? presetSubSubcategory
                    : 'all'
            );
            setSuggestedOffset(0);
        }
    }, [presetSubcategory, presetSubSubcategory]);

    const gridColumns = isMobile ? 2 : (isTablet ? 3 : 4);
    const gridGap = isMobile ? 10 : 8;
    const gridVariant = isMobile ? 'standard' : 'masonry';

    // Build SEO-friendly URL: /asset/:categorySlug/:subSlug/:titleSlug
    const buildAssetUrl = useCallback(
        (img) => {
            const categorySlug = slugify(getCategoryName(img.category)) || 'image';
            const subSlug = slugify(getSubcategoryName(img.subcategory)) || 'all';
            return `/asset/${categorySlug}/${subSlug}/${getAssetUrlSlug(img)}`;
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
                await navigator.share({ title: getAssetDisplayName(img, 'Asset'), url: detailUrl });
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
        params.set('title', getAssetDisplayName(img, 'Asset'));
        navigate(`/design-elvify?${params.toString()}`);
    }, [navigate]);
    const handleEditAsset = useCallback((img) => {
        if (!img?._id) return;
        const params = new URLSearchParams();
        params.set('assetId', img._id);
        if (img.imageUrl) params.set('assetUrl', img.imageUrl);
        params.set('title', getAssetDisplayName(img, 'Asset'));
        navigate(`/design-elvify?${params.toString()}`);
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
            const baseTitle = getAssetDownloadBaseName(img);
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

    const resolveSubcategoryForStyle = useCallback(
        (styleLabel) => {
            if (activeSubcategory && activeSubcategory !== 'all') return activeSubcategory;

            const target = normalize(styleLabel);
            if (!target) return activeSubcategory || 'all';

            for (const subcategory of taxonomySubcategoryMap.values()) {
                const children = Array.isArray(subcategory?.children) ? subcategory.children : [];
                const hasStyle = children.some((child) => normalize(getSubSubcategoryName(child)) === target);
                if (hasStyle) {
                    const subcategoryName = getSubcategoryName(subcategory);
                    if (subcategoryName) return subcategoryName;
                }
            }

            const matchingBucket = Object.entries(subcategoryBuckets).find(([, bucket]) =>
                Array.from(bucket.subsubs || []).some((subsub) => normalize(subsub) === target)
            );

            return matchingBucket?.[0] || activeSubcategory || 'all';
        },
        [activeSubcategory, getSubSubcategoryName, getSubcategoryName, normalize, subcategoryBuckets, taxonomySubcategoryMap]
    );

    const suggestedStyleItems = useMemo(() => {
        if (useBootstrapMode) {
            return (bootstrapSuggestedStyles?.items || [])
                .slice(suggestedOffset, suggestedOffset + SUGGESTED_STYLE_SLICE_LIMIT)
                .map((item) => ({
                    label: item.name,
                    count: Number(item.assetCount || 0),
                    order: Number.isFinite(Number(item.order)) ? Number(item.order) : 9999,
                    icon: item.icon || recommendSuggestedStyleIcon(item.name, name, activeSubcategory),
                    iconColor: item.iconColor || DEFAULT_SUGGESTED_ICON_COLOR,
                    iconBg: item.iconBg || DEFAULT_SUGGESTED_ICON_BG,
                    hasAdminRef: true,
                }));
        }

        const counts = new Map();
        const scopedBuckets = activeSubcategory === 'all'
            ? Object.values(subcategoryBuckets)
            : [subcategoryBuckets[activeSubcategory]].filter(Boolean);

        scopedBuckets.forEach((bucket) => {
            bucket.items.forEach((item) => {
                const subsub = getSubSubcategoryName(item.subsubcategory)?.trim();
                if (!subsub) return;
                counts.set(subsub, (counts.get(subsub) || 0) + 1);
            });
        });

        const activeTaxonomySubcat = activeSubcategory !== 'all'
            ? taxonomySubcategoryMap.get(normalize(activeSubcategory))
            : null;
        const taxonomySubsubs = Array.isArray(activeTaxonomySubcat?.children)
            ? activeTaxonomySubcat.children
            : [];
        const hasAdminSuggested = taxonomySubsubs.some((item) => item?.showInSuggestedStyles === true);
        const adminMeta = new Map();

        taxonomySubsubs
            .filter((item) => !hasAdminSuggested || item?.showInSuggestedStyles === true)
            .forEach((item) => {
                const label = getSubSubcategoryName(item);
                if (!label) return;
                adminMeta.set(normalize(label), {
                    order: Number.isFinite(Number(item?.suggestedOrder)) ? Number(item.suggestedOrder) : 9999,
                    icon: item?.suggestedIcon && item.suggestedIcon !== DEFAULT_SUGGESTED_STYLE_ICON
                        ? item.suggestedIcon
                        : recommendSuggestedStyleIcon(label, name, activeSubcategory),
                    iconColor: item?.suggestedIconColor || DEFAULT_SUGGESTED_ICON_COLOR,
                    iconBg: item?.suggestedIconBg || DEFAULT_SUGGESTED_ICON_BG,
                });
            });

        return Array.from(counts.entries())
            .map(([label, count]) => ({
                label,
                count,
                order: adminMeta.get(normalize(label))?.order ?? 9999,
                icon: adminMeta.get(normalize(label))?.icon || recommendSuggestedStyleIcon(label, name, activeSubcategory),
                iconColor: adminMeta.get(normalize(label))?.iconColor || DEFAULT_SUGGESTED_ICON_COLOR,
                iconBg: adminMeta.get(normalize(label))?.iconBg || DEFAULT_SUGGESTED_ICON_BG,
                hasAdminRef: adminMeta.has(normalize(label)),
            }))
            .filter((item) => !hasAdminSuggested || item.hasAdminRef)
            .sort((left, right) => {
                if (left.order !== right.order) return left.order - right.order;
                if (right.count !== left.count) return right.count - left.count;
                return left.label.localeCompare(right.label);
            })
            .slice(0, 18);
    }, [
        useBootstrapMode,
        bootstrapSuggestedStyles?.items,
        suggestedOffset,
        activeSubcategory,
        getSubSubcategoryName,
        name,
        normalize,
        subcategoryBuckets,
        taxonomySubcategoryMap,
    ]);

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

    const bootstrapSubcategoryTotal = useBootstrapMode ? Number(bootstrapSubcategories?.total || bootstrapSubcategories?.items?.length || 0) : 0;
    const bootstrapSuggestedTotal = useBootstrapMode ? Number(bootstrapSuggestedStyles?.total || bootstrapSuggestedStyles?.items?.length || 0) : 0;
    const hasBootstrapSubcategoryPrev = useBootstrapMode && subcategoryOffset > 0;
    const hasBootstrapSubcategoryNext = useBootstrapMode && subcategoryOffset + SUBCATEGORY_SLICE_LIMIT < bootstrapSubcategoryTotal;
    const hasBootstrapSuggestedPrev = useBootstrapMode && suggestedOffset > 0;
    const hasBootstrapSuggestedNext = useBootstrapMode && suggestedOffset + SUGGESTED_STYLE_SLICE_LIMIT < bootstrapSuggestedTotal;

    useEffect(() => {
        if (!useBootstrapMode) return;
        setSubcategoryOffset((offset) => Math.min(offset, Math.max(0, bootstrapSubcategoryTotal - SUBCATEGORY_SLICE_LIMIT)));
    }, [useBootstrapMode, bootstrapSubcategoryTotal]);

    useEffect(() => {
        if (!useBootstrapMode) return;
        setSuggestedOffset((offset) => Math.min(offset, Math.max(0, bootstrapSuggestedTotal - SUGGESTED_STYLE_SLICE_LIMIT)));
    }, [useBootstrapMode, bootstrapSuggestedTotal]);

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

    const totalPaginatedItems = useBootstrapMode
        ? Number(bootstrapAssets?.total || paginatedEntries.length)
        : useProvidedImagesMode
            ? Number(providedTotal || paginatedEntries.length)
        : paginatedEntries.length;
    const totalPages = Math.max(1, Math.ceil(totalPaginatedItems / COLLECTION_PAGE_SIZE));

    const pagedEntries = useMemo(() => {
        if (useBootstrapMode || useProvidedImagesMode) return paginatedEntries;
        const startIndex = (currentPage - 1) * COLLECTION_PAGE_SIZE;
        return paginatedEntries.slice(startIndex, startIndex + COLLECTION_PAGE_SIZE);
    }, [useBootstrapMode, useProvidedImagesMode, currentPage, paginatedEntries]);

    const visibleAssetIds = useMemo(
        () => pagedEntries.map((entry) => entry?.img?._id).filter(Boolean),
        [pagedEntries]
    );
    const likeStatusQuery = useAssetLikeStatusBatchQuery(visibleAssetIds, isLoggedIn);
    const likeStatusMap = likeStatusQuery.data || {};

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
                navigate(`/search/${encodeURIComponent(slugify(name || 'image'))}/${encodeURIComponent(subcat)}`);
            } else {
                // In normal category page: local filter by subcategory
                setActiveSubcategory(subcat);
                setActiveSubsubcategory('all');
                setSuggestedOffset(0);
                navigate(buildCollectionPath({
                    subcategory: subcat,
                    subsubcategory: 'all',
                    page: 1,
                    includeSearch: false,
                }));
            }
        },
        [buildCollectionPath, isSearchMode, name, navigate, slugify]
    );

    const scrollPills = useCallback((direction) => {
        if (useBootstrapMode) {
            setSubcategoryOffset((offset) => {
                const nextOffset = offset + (direction > 0 ? SUBCATEGORY_SLICE_LIMIT : -SUBCATEGORY_SLICE_LIMIT);
                const maxOffset = Math.max(0, bootstrapSubcategoryTotal - SUBCATEGORY_SLICE_LIMIT);
                return Math.min(Math.max(0, nextOffset), maxOffset);
            });
            return;
        }

        const row = pillsRowRef.current;
        if (!row) return;
        const step = Math.max(220, Math.floor(row.clientWidth * 0.75));
        row.scrollBy({ left: direction * step, behavior: 'smooth' });
    }, [useBootstrapMode, bootstrapSubcategoryTotal]);

    const scrollSuggestedStyles = useCallback((direction) => {
        if (useBootstrapMode) {
            setSuggestedOffset((offset) => {
                const nextOffset = offset + (direction > 0 ? SUGGESTED_STYLE_SLICE_LIMIT : -SUGGESTED_STYLE_SLICE_LIMIT);
                const maxOffset = Math.max(0, bootstrapSuggestedTotal - SUGGESTED_STYLE_SLICE_LIMIT);
                return Math.min(Math.max(0, nextOffset), maxOffset);
            });
            return;
        }

        const row = suggestedRowRef.current;
        if (!row) return;
        const step = Math.max(260, Math.floor(row.clientWidth * 0.82));
        row.scrollBy({ left: direction * step, behavior: 'smooth' });
    }, [useBootstrapMode, bootstrapSuggestedTotal]);

    const updatePillArrowVisibility = useCallback(() => {
        if (useBootstrapMode) {
            setShowPillArrows(bootstrapSubcategoryTotal > SUBCATEGORY_SLICE_LIMIT);
            return;
        }

        const row = pillsRowRef.current;
        if (!row) {
            setShowPillArrows(false);
            return;
        }
        const overflowed = row.scrollWidth > row.clientWidth + 2;
        setShowPillArrows(overflowed);
    }, [useBootstrapMode, bootstrapSubcategoryTotal]);

    const updateSuggestedArrowVisibility = useCallback(() => {
        if (useBootstrapMode) {
            setShowSuggestedArrows(bootstrapSuggestedTotal > SUGGESTED_STYLE_SLICE_LIMIT);
            return;
        }

        const row = suggestedRowRef.current;
        if (!row) {
            setShowSuggestedArrows(false);
            return;
        }
        setShowSuggestedArrows(row.scrollWidth > row.clientWidth + 2);
    }, [useBootstrapMode, bootstrapSuggestedTotal]);

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

    useEffect(() => {
        updateSuggestedArrowVisibility();
        window.addEventListener('resize', updateSuggestedArrowVisibility);
        return () => window.removeEventListener('resize', updateSuggestedArrowVisibility);
    }, [activeSubcategory, suggestedStyleItems.length, updateSuggestedArrowVisibility]);

    return (
        <>
        <div className="container filteration-page-container">
            {suggestedStyleItems.length > 0 && (
                <section className="filteration-suggested mb-3" aria-label="Suggested styles">
                    <div className="filteration-suggested__header">
                        <div>
                            <div className="filteration-suggested__title">
                                <FiZap size={16} />
                                Pick Suggested Styles
                            </div>
                            <p className="filteration-suggested__subtitle">
                                {activeSubcategory === 'all'
                                    ? 'Choose from curated styles in this category'
                                    : `Choose styles related to ${activeSubcategory}`}
                            </p>
                        </div>
                    </div>

                    <div className="filteration-suggested__shell">
                        {showSuggestedArrows ? (
                            <button
                                type="button"
                                className="filteration-carousel-arrow filteration-carousel-arrow--left"
                                onClick={() => scrollSuggestedStyles(-1)}
                                disabled={useBootstrapMode && !hasBootstrapSuggestedPrev}
                                aria-label="Scroll suggested styles left"
                            >
                                <FiChevronLeft size={18} />
                            </button>
                        ) : null}

                        <div ref={suggestedRowRef} className="filteration-suggested__track">
                            {suggestedStyleItems.map((styleItem) => {
                                const StyleIcon = getSuggestedStyleIcon(styleItem.icon);
                                return (
                                    <button
                                        key={styleItem.label}
                                        type="button"
                                        className={`filteration-suggested-card ${activeSubsubcategory === styleItem.label ? 'is-active' : ''}`}
                                        onClick={() => {
                                            const nextSubcategory = resolveSubcategoryForStyle(styleItem.label);
                                            setActiveSubcategory(nextSubcategory);
                                            setActiveSubsubcategory(styleItem.label);
                                            setSuggestedOffset(0);
                                            navigate(buildCollectionPath({
                                                subcategory: nextSubcategory,
                                                subsubcategory: styleItem.label,
                                                page: 1,
                                                includeSearch: false,
                                            }));
                                        }}
                                    >
                                        <span
                                            className="filteration-suggested-card__icon"
                                            style={{
                                                color: styleItem.iconColor,
                                                background: styleItem.iconBg,
                                            }}
                                        >
                                            <StyleIcon size={18} />
                                        </span>
                                        <span className="filteration-suggested-card__text">{styleItem.label}</span>
                                        <span className="filteration-suggested-card__meta">{styleItem.count} assets</span>
                                    </button>
                                );
                            })}
                        </div>

                        {showSuggestedArrows ? (
                            <button
                                type="button"
                                className="filteration-carousel-arrow filteration-carousel-arrow--right"
                                onClick={() => scrollSuggestedStyles(1)}
                                disabled={useBootstrapMode && !hasBootstrapSuggestedNext}
                                aria-label="Scroll suggested styles right"
                            >
                                <FiChevronRight size={18} />
                            </button>
                        ) : null}
                    </div>
                </section>
            )}

            {/* Row 1: category + subcategory carousel */}
            <div className="filteration-pill-shell mb-3">
                {showPillArrows ? (
                    <button
                        type="button"
                    className="filteration-carousel-arrow filteration-carousel-arrow--left"
                    onClick={() => scrollPills(-1)}
                    disabled={useBootstrapMode && !hasBootstrapSubcategoryPrev}
                    aria-label="Scroll categories left"
                    >
                        <FiChevronLeft size={16} />
                    </button>
                ) : null}

                <div
                    ref={pillsRowRef}
                    className={`filteration-pill-row ${showPillArrows ? 'filteration-pill-row--with-arrows' : ''}`}
                >
                <span className="filteration-pill-label">
                    {`Category/${name ? name.charAt(0).toUpperCase() + name.slice(1) : 'All'}`}
                </span>

                {!isSearchMode && (
                    <button
                        className={`filteration-category-pill ${activeSubcategory === 'all' ? 'is-active' : ''}`}
                        onClick={() => {
                            setActiveSubcategory('all');
                            setActiveSubsubcategory('all');
                            setSuggestedOffset(0);
                            navigate(buildCollectionPath({
                                subcategory: 'all',
                                subsubcategory: 'all',
                                page: 1,
                                includeSearch: false,
                            }));
                        }}
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
                        className={`filteration-category-pill ${activeSubcategory === subcat ? 'is-active' : ''}`}
                        onClick={() => handleSubcategoryPillClick(subcat)}
                    >
                        {subcat}
                    </button>
                ))}
                </div>

                {showPillArrows ? (
                    <button
                        type="button"
                        className="filteration-carousel-arrow filteration-carousel-arrow--right"
                        onClick={() => scrollPills(1)}
                        disabled={useBootstrapMode && !hasBootstrapSubcategoryNext}
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
                        if (useBootstrapMode) {
                            collectionNavigationQuery.refetch();
                            collectionAssetsQuery.refetch();
                        }
                        else if (creatorId) creatorImagesQuery.refetch();
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
                                        {items.map((img, itemIndex) => {
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
                                                            src={getBrowseMediaUrl(img)}
                                                            priority={itemIndex < 4}
                                                            alt={getAssetDisplayName(
                                                                img,
                                                                getSubcategoryName(img.subcategory) ||
                                                                    getCategoryName(img.category) ||
                                                                    getSubSubcategoryName(img.subsubcategory) ||
                                                                    'Asset'
                                                            )}
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
                                                                <LikeBttnSm
                                                                    imgId={img?._id}
                                                                    compact
                                                                    stopPropagation
                                                                    initialLikesCount={img?.likes}
                                                                    initialLiked={isLoggedIn ? Boolean(likeStatusMap[String(img?._id)]) : false}
                                                                    skipInvalidate
                                                                />
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













