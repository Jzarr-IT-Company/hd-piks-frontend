import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Skeleton } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import API_BASE_URL from '../../config/api.config.js';
import { FiDownload, FiShare2, FiCompass, FiFolderPlus, FiEdit3 } from 'react-icons/fi';
import CollectionSelectModal from '../CollectionSelectModal';
import LikeBttnSm from '../LikeBttnSm/LikeBttnSm.jsx';
import { QueryErrorRetry, QueryGridSkeleton } from '../QueryState/QueryState.jsx';
import { PAGE_SIZE, useAssetsPageQuery } from '../../query/assetsQueries.js';
import { usePublicCategoriesQuery } from '../../query/categoryQueries.js';
import { getResponsiveImageProps } from '../../utils/mediaVariants.js';
import { trackAssetDownloadEvent } from '../../utils/downloadTracking.js';
import { buildHomepageCategoryEntries } from '../../utils/homepageCategories.js';
import '../LazyLoadImage2/LazyLoadImage.css';
import './HomeGallery.css';

const normalizeLicenseValue = (value) => String(value || '').trim().toLowerCase();
const isPremiumByLicense = (value) => normalizeLicenseValue(value) === 'premium';

// Reusable gallery card
function GalleryItem({
    asset,
    imageProps,
    alt,
    onOpen,
    onEdit,
    onDiscoverSimilar,
    onShare,
    onDownload,
    onSaveToCollection,
    getName
}) {
    const [loaded, setLoaded] = useState(false);
    const [videoDuration, setVideoDuration] = useState(null);
    const videoRef = useRef(null);
    const isVideoAsset = (
        asset?.fileMetadata?.mimeType?.startsWith('video/')
        || asset?.imagetype?.startsWith('video/')
        || /\\.mp4$|\\.mov$|\\.m4v$|\\.webm$/i.test(imageProps?.src || '')
    );
    const isPremiumAsset = isPremiumByLicense(asset?.freePremium);

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
        const fromMeta = asset?.fileMetadata?.duration;
        if (fromMeta != null && fromMeta !== '') return formatDuration(fromMeta);
        if (videoDuration != null) return formatDuration(videoDuration);
        return null;
    }, [asset?.fileMetadata?.duration, videoDuration, formatDuration]);

    const handleCardMouseEnter = useCallback(() => {
        if (!isVideoAsset || !videoRef.current) return;
        const p = videoRef.current.play();
        if (p && typeof p.catch === 'function') {
            p.catch(() => {});
        }
    }, [isVideoAsset]);

    const handleCardMouseLeave = useCallback(() => {
        if (!isVideoAsset || !videoRef.current) return;
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
    }, [isVideoAsset]);

    return (
        <div
            className="lazy-image-wrapper home-gallery__card"
            style={{ position: 'relative', width: '100%', paddingBottom: '70%', cursor: onOpen ? 'pointer' : 'default' }}
            onClick={onOpen}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
        >
            {!loaded && (
                <div className="lazy-skeleton-overlay">
                    <Skeleton.Image
                        active
                        style={{ width: '100%', height: '100%', borderRadius: 16 }}
                    />
                </div>
            )}
            {isVideoAsset ? (
                <video
                    ref={videoRef}
                    src={imageProps?.src}
                    className="lazy-image"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 16,
                        opacity: loaded ? 1 : 0,
                        transition: 'opacity 0.35s ease',
                        backgroundColor: '#000',
                    }}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadedData={() => setLoaded(true)}
                    onLoadedMetadata={(event) => {
                        setLoaded(true);
                        if (Number.isFinite(event?.currentTarget?.duration)) {
                            setVideoDuration(event.currentTarget.duration);
                        }
                    }}
                    onError={() => setLoaded(true)}
                />
            ) : (
                <img
                    src={imageProps?.src}
                    srcSet={imageProps?.srcSet || undefined}
                    sizes={imageProps?.sizes || undefined}
                    alt={alt}
                    className="lazy-image"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 16,
                        opacity: loaded ? 1 : 0,
                        transition: 'opacity 0.35s ease',
                    }}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                />
            )}
            {isVideoAsset && durationLabel && (
                <div className="home-gallery__video-duration" aria-label={`Duration ${durationLabel}`}>
                    {durationLabel}
                </div>
            )}
            <span
                className={`home-gallery__license-tag ${isPremiumAsset ? 'home-gallery__license-tag--premium' : 'home-gallery__license-tag--free'}`}
            >
                {isPremiumAsset ? 'Premium' : 'Free'}
            </span>

            <div className="home-gallery__hover-actions">
                <div className="home-gallery__overlay-top">
                    <button
                        type="button"
                        className="home-gallery__icon-btn"
                        aria-label="Edit image"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(asset);
                        }}
                    >
                        <FiEdit3 size={16} />
                    </button>
                    <button
                        type="button"
                        className="home-gallery__icon-btn"
                        aria-label="Discover similar"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDiscoverSimilar(asset);
                        }}
                    >
                        <FiCompass size={16} />
                    </button>
                    <button
                        type="button"
                        className="home-gallery__icon-btn"
                        aria-label="Save to collection"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSaveToCollection(asset);
                        }}
                    >
                        <FiFolderPlus size={16} />
                    </button>
                    <button
                        type="button"
                        className="home-gallery__icon-btn"
                        aria-label="Share"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShare(asset);
                        }}
                    >
                        <FiShare2 size={16} />
                    </button>
                    <button
                        type="button"
                        className="home-gallery__icon-btn"
                        aria-label="Download"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownload(asset);
                        }}
                    >
                        <FiDownload size={16} />
                    </button>
                    <LikeBttnSm imgId={asset?._id} compact stopPropagation />
                </div>

                <div className="home-gallery__overlay-meta">
                    <div className="home-gallery__overlay-sub">
                        {getName(asset?.subcategory) || getName(asset?.category) || 'Asset'}
                    </div>
                    <div className="home-gallery__overlay-title">
                        {asset?.title || 'Untitled'}
                    </div>
                </div>
            </div>
        </div>
    );
}

function HomeGallery() {
    const navigate = useNavigate();
    const { galleryCategory: galleryCategoryParamRaw, galleryPage: galleryPageParamRaw } = useParams();
    const categoriesQuery = usePublicCategoriesQuery();
    const homepageCategories = useMemo(
        () => buildHomepageCategoryEntries(categoriesQuery.data),
        [categoriesQuery.data]
    );
    const tabOptions = useMemo(
        () => ([
            { value: 'all', label: 'All' },
            ...homepageCategories.map((category) => ({
                value: category.filterValue,
                label: category.tabLabel,
            })),
        ]),
        [homepageCategories]
    );

    const galleryCategoryParam = galleryCategoryParamRaw
        ? decodeURIComponent(galleryCategoryParamRaw)
        : 'all';
    const parsedGalleryPage = Number.parseInt(galleryPageParamRaw || '1', 10);
    const currentPage = Number.isFinite(parsedGalleryPage) && parsedGalleryPage > 0 ? parsedGalleryPage : 1;
    const activeTab = tabOptions.some((tab) => tab.value === galleryCategoryParam) ? galleryCategoryParam : 'all';
    const parentFilter = activeTab === 'all' ? undefined : activeTab;

    const assetsQuery = useAssetsPageQuery(parentFilter, currentPage, PAGE_SIZE);
    const items = assetsQuery.data?.items || [];
    const loading = assetsQuery.isLoading;
    const loadingMore = assetsQuery.isFetching;
    const lastKnownTotalPagesRef = useRef(1);
    const resolvedTotalPages = assetsQuery.data?.totalPages;
    if (Number.isFinite(resolvedTotalPages) && resolvedTotalPages > 0) {
        lastKnownTotalPagesRef.current = resolvedTotalPages;
    }
    const totalPages = Number.isFinite(resolvedTotalPages) && resolvedTotalPages > 0
        ? resolvedTotalPages
        : Math.max(lastKnownTotalPagesRef.current || 1, currentPage || 1);
    const error = assetsQuery.error?.response?.data?.message || assetsQuery.error?.message || '';
    const [downloadTarget, setDownloadTarget] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState(null);

    const buildGalleryPath = useCallback((nextCategory, nextPage) => {
        const normalizedPage = Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1;
        const hasCategory = nextCategory && nextCategory !== 'all';

        if (hasCategory && normalizedPage > 1) {
            return `/galleryCategory/${encodeURIComponent(nextCategory)}/Page/${normalizedPage}`;
        }
        if (hasCategory) {
            return `/galleryCategory/${encodeURIComponent(nextCategory)}`;
        }
        if (normalizedPage > 1) {
            return `/Page/${normalizedPage}`;
        }
        return '/';
    }, []);

    const updateGalleryParams = useCallback((nextCategory, nextPage, replace = false) => {
        navigate(buildGalleryPath(nextCategory, nextPage), { replace });
    }, [buildGalleryPath, navigate]);

    const handleTabClick = (tab) => {
        updateGalleryParams(tab, 1);
    };

    const handlePageChange = useCallback((page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        updateGalleryParams(activeTab, page);
        const sectionTop = document.querySelector('.home-gallery-section');
        if (sectionTop) {
            sectionTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeTab, currentPage, totalPages, updateGalleryParams]);

    const visiblePages = useMemo(() => {
        const total = Math.max(1, totalPages);
        const pages = new Set([1, total, currentPage, currentPage - 1, currentPage + 1]);
        return Array.from(pages)
            .filter((page) => page >= 1 && page <= total)
            .sort((a, b) => a - b);
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (loadingMore) return;
        if (!Number.isFinite(resolvedTotalPages) || resolvedTotalPages <= 0) return;
        if (currentPage > resolvedTotalPages) {
            updateGalleryParams(activeTab, resolvedTotalPages, true);
        }
    }, [activeTab, currentPage, loadingMore, resolvedTotalPages, updateGalleryParams]);

    const normalize = useCallback((val) => {
        if (typeof val === 'string') return val.trim().toLowerCase();
        if (val == null) return '';
        return String(val).trim().toLowerCase();
    }, []);

    const getName = useCallback((field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object') return field.name || '';
        return String(field);
    }, []);

    const slugify = useCallback(
        (val) => {
            const base = normalize(val || '');
            if (!base) return '';
            return base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        },
        [normalize]
    );

    // /asset/:categorySlug/:subSlug/:id
    const buildAssetUrl = useCallback(
        (asset) => {
            const categorySlug = slugify(getName(asset.category)) || 'image';
            const subSlug = slugify(getName(asset.subcategory)) || 'all';
            return `/asset/${categorySlug}/${subSlug}/${asset._id}`;
        },
        [slugify, getName]
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

    const getVariantsForItem = useCallback((item) => {
        if (!item) return [];
        const variants = Array.isArray(item.mediaVariants) ? [...item.mediaVariants] : [];
        if (!variants.length && item.imageUrl) {
            variants.push({
                variant: 'original',
                url: item.imageUrl,
                s3Key: item.s3Key || null,
                dimensions: {
                    width: item.fileMetadata?.dimensions?.width || null,
                    height: item.fileMetadata?.dimensions?.height || null,
                },
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

    const handleDiscoverSimilar = useCallback((asset) => {
        const categoryName = getName(asset?.category);
        if (!categoryName) return;
        const subName = getName(asset?.subcategory);
        const subSubName = getName(asset?.subsubcategory);
        const params = new URLSearchParams();
        params.set('discover', '1');
        if (subName) params.set('dsSub', subName);
        if (subSubName) params.set('dsSubSub', subSubName);
        navigate(`/collection/${encodeURIComponent(normalize(categoryName))}?${params.toString()}`);
    }, [navigate, normalize, getName]);

    const handleEdit = useCallback((asset) => {
        if (!asset?._id) return;
        const params = new URLSearchParams();
        params.set('assetId', asset._id);
        if (asset.imageUrl) params.set('assetUrl', asset.imageUrl);
        if (asset.title) params.set('title', asset.title);
        navigate(`/design-hdpiks?${params.toString()}`);
    }, [navigate]);

    const handleShare = useCallback(async (asset) => {
        if (!asset) return;
        const detailUrl = asset?._id
            ? `${window.location.origin}${buildAssetUrl(asset)}`
            : asset?.imageUrl || window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: asset?.title || 'Asset', url: detailUrl });
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

    const handleDownload = useCallback((asset) => {
        if (!asset) return;
        if (isPremiumByLicense(asset?.freePremium)) {
            navigate(buildAssetUrl(asset));
            return;
        }
        setDownloadTarget(asset);
        setShowDownloadModal(true);
    }, [navigate, buildAssetUrl]);

    const handleSaveToCollection = useCallback((asset) => {
        if (!asset?._id) return;

        const token = Cookies.get('token');
        if (!token) {
            alert('Please login to save assets to a collection.');
            navigate('/login');
            return;
        }

        setSelectedAssetId(asset._id);
        setShowCollectionModal(true);
    }, [navigate]);

    const handleCloseCollectionModal = useCallback(() => {
        setShowCollectionModal(false);
        setSelectedAssetId(null);
    }, []);

    const handleVariantDownload = useCallback(async (variant, item) => {
        if (!variant || !variant.url) return;

        try {
            const label = variant.variant
                ? variant.variant.charAt(0).toUpperCase() + variant.variant.slice(1)
                : 'Original';
            const w = variant.dimensions?.width;
            const h = variant.dimensions?.height;
            const sizeSuffix = w && h ? `-${w}x${h}px` : '';
            const baseTitle = (item?.title || 'asset').toString().replace(/[^\\w.-]+/g, '-');
            const ext = getExtensionFromUrl(variant.url) || '';
            const fileName = `${baseTitle}-${label}${sizeSuffix}${ext}`;

            let href = variant.url;
            const tracked = await trackAssetDownloadEvent({
                assetId: item?._id,
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

    return (
        <section className="py-5 home-gallery-section">
            <div className="container">
                {/* Heading */}
                <h3 className="fw-bold display-5 mb-2 text-center text-md-start">
                    Inspiration Gallery
                </h3>
                <p className="text-muted fw-semibold mb-4 text-center text-md-start">
                    Discover fresh stock content from our creators across all categories.
                </p>

                {/* Tabs */}
                <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center justify-content-md-start">
                    {tabOptions.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => handleTabClick(tab.value)}
                            className="btn btn-sm"
                            style={{
                                borderRadius: 999,
                                padding: '6px 18px',
                                fontSize: 13,
                                border:
                                    activeTab === tab.value
                                        ? '1px solid rgb(143, 92, 255)'
                                        : '1px solid rgba(148,163,184,0.6)',
                                background:
                                    activeTab === tab.value
                                        ? 'linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))'
                                        : '#ffffff',
                                color: activeTab === tab.value ? '#ffffff' : '#0f172a',
                                boxShadow:
                                    activeTab === tab.value ? '0 1px 3px rgba(15,23,42,0.25)' : 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Error state */}
                {error && !loading && (
                    <QueryErrorRetry
                        message={error}
                        onRetry={() => assetsQuery.refetch()}
                    />
                )}

                {/* Grid */}
                <div className="row g-3">
                    {/* Loading skeletons (initial or loading more and no items yet) */}
                    {loading && !items.length && (
                        <QueryGridSkeleton count={8} />
                    )}

                    {/* Items */}
                    {items.map((asset) => (
                        <div key={asset._id} className="col-6 col-md-3">
                            <GalleryItem
                                asset={asset}
                                imageProps={getResponsiveImageProps(asset, { preferredOrder: ['thumbnail', 'small', 'medium', 'large', 'original'], sizes: '(max-width: 576px) 50vw, (max-width: 992px) 33vw, 265px' })}
                                alt={asset.title || getName(asset.subcategory) || 'Asset'}
                                onOpen={() => navigate(buildAssetUrl(asset))}
                                onEdit={handleEdit}
                                onDiscoverSimilar={handleDiscoverSimilar}
                                onShare={handleShare}
                                onDownload={handleDownload}
                                onSaveToCollection={handleSaveToCollection}
                                getName={getName}
                            />
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {!loading && !items.length && !error && (
                    <p className="text-muted mt-3">
                        No assets found for this category yet.
                    </p>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap mt-4">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || loadingMore}
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
                                        disabled={loadingMore}
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
                            disabled={currentPage >= totalPages || loadingMore}
                        >
                            Next
                        </button>
                    </div>
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
                                    handleEdit(downloadTarget);
                                    setShowDownloadModal(false);
                                    setDownloadTarget(null);
                                }}
                            >
                                Edit with HDPiks
                            </button>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#555' }}>
                                FILE SIZE
                            </div>
                            {getVariantsForItem(downloadTarget).map((v) => {
                                const label = v.variant.charAt(0).toUpperCase() + v.variant.slice(1);
                                const w = v.dimensions?.width;
                                const h = v.dimensions?.height;
                                const sizeLabel = w && h ? `${w} x ${h}px` : '';
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
        </section>
    );
}

export default HomeGallery;



