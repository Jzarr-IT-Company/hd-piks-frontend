import React, { useEffect, useState, useCallback } from 'react';
import { Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../../Services/api.js';
import API_BASE_URL, { API_ENDPOINTS } from '../../config/api.config.js';
import { FiDownload, FiShare2, FiCompass, FiFolderPlus, FiEdit3 } from 'react-icons/fi';
import CollectionSelectModal from '../CollectionSelectModal';
import '../LazyLoadImage2/LazyLoadImage.css';
import './HomeGallery.css';

const PAGE_SIZE = 16;

// Hook: paginated assets for homepage gallery
function useHomeGallery(parentCategory) {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchPage = useCallback(
        async (pageToLoad, replace = false) => {
            try {
                setLoading(true);
                const params = {
                    page: pageToLoad,
                    limit: PAGE_SIZE,
                };
                if (parentCategory && parentCategory !== 'all') {
                    params.parentCategory = parentCategory; // e.g. "Image", "Mockups"
                }
                const res = await api.get(API_ENDPOINTS.ASSETS, { params });
                const data = res.data?.data || [];
                setItems((prev) => (replace ? data : [...prev, ...data]));
                // simple hasMore: if fewer than page size, assume no more
                setHasMore(data.length === PAGE_SIZE);
                setError('');
            } catch (e) {
                console.error('[HomeGallery] fetch assets failed', e);
                setError(e?.response?.data?.message || e.message || 'Failed to load assets');
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        },
        [parentCategory]
    );

    // initial + when filter changes
    useEffect(() => {
        setItems([]);
        setPage(1);
        fetchPage(1, true);
    }, [parentCategory, fetchPage]);

    const loadMore = useCallback(() => {
        if (!hasMore || loading) return;
        const next = page + 1;
        setPage(next);
        fetchPage(next, false);
    }, [page, hasMore, loading, fetchPage]);

    return { items, loading, error, hasMore, loadMore };
}

// Reusable gallery card
function GalleryItem({
    asset,
    src,
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
    const isVideoAsset = (
        asset?.fileMetadata?.mimeType?.startsWith('video/')
        || asset?.imagetype?.startsWith('video/')
        || /\.mp4$|\.mov$|\.m4v$|\.webm$/i.test(src || '')
    );

    return (
        <div
            className="lazy-image-wrapper home-gallery__card"
            style={{ position: 'relative', width: '100%', paddingBottom: '70%', cursor: onOpen ? 'pointer' : 'default' }}
            onClick={onOpen}
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
                    src={src}
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
                    onError={() => setLoaded(true)}
                />
            ) : (
                <img
                    src={src}
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
    // Tabs: all / Image / Video / Mockups
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Image' | 'Video' | 'Mockups'

    const parentFilter =
        activeTab === 'all'
            ? undefined
            : activeTab; // sent as parentCategory name to backend

    const { items, loading, error, hasMore, loadMore } = useHomeGallery(parentFilter);
    const [downloadTarget, setDownloadTarget] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState(null);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

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
        setDownloadTarget(asset);
        setShowDownloadModal(true);
    }, []);

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

    const handleVariantDownload = useCallback((variant, item) => {
        if (!variant || !variant.url) return;

        const label = variant.variant
            ? variant.variant.charAt(0).toUpperCase() + variant.variant.slice(1)
            : 'Original';
        const w = variant.dimensions?.width;
        const h = variant.dimensions?.height;
        const sizeSuffix = w && h ? `-${w}x${h}px` : '';
        const baseTitle = (item?.title || 'asset').toString().replace(/[^\w.-]+/g, '-');
        const ext = getExtensionFromUrl(variant.url) || '';
        const fileName = `${baseTitle}-${label}${sizeSuffix}${ext}`;

        let href = variant.url;
        if (variant.s3Key) {
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
    }, [getExtensionFromUrl]);

    return (
        <section className="py-5">
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
                    {['all', 'Image', 'Video', 'Mockups'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => handleTabClick(tab)}
                            className="btn btn-sm"
                            style={{
                                borderRadius: 999,
                                padding: '6px 18px',
                                fontSize: 13,
                                border:
                                    activeTab === tab
                                        ? '1px solid rgb(143, 92, 255)'
                                        : '1px solid rgba(148,163,184,0.6)',
                                background:
                                    activeTab === tab
                                        ? 'linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))'
                                        : '#ffffff',
                                color: activeTab === tab ? '#ffffff' : '#0f172a',
                                boxShadow:
                                    activeTab === tab ? '0 1px 3px rgba(15,23,42,0.25)' : 'none',
                            }}
                        >
                            {tab === 'all' ? 'All' : tab}
                        </button>
                    ))}
                </div>

                {/* Error state */}
                {error && !loading && (
                    <div className="alert alert-danger py-2 mb-3">
                        {error}
                    </div>
                )}

                {/* Grid */}
                <div className="row g-3">
                    {/* Loading skeletons (initial or loading more and no items yet) */}
                    {loading && !items.length && (
                        <>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="col-6 col-md-3">
                                    <div className="lazy-image-wrapper" style={{ paddingBottom: '70%' }}>
                                        <Skeleton.Image
                                            active
                                            style={{ width: '100%', height: '100%', borderRadius: 16 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Items */}
                    {items.map((asset) => (
                        <div key={asset._id} className="col-6 col-md-3">
                            <GalleryItem
                                asset={asset}
                                src={asset.imageUrl}
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

                {/* Load more */}
                {hasMore && (
                    <div className="d-flex justify-content-center mt-4">
                        <button
                            type="button"
                            className="btn btn-outline-dark px-4"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load more'}
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
