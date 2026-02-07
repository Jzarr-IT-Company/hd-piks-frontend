import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGlobalState } from '../../Context/Context';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ImageList, ImageListItem, Skeleton } from '@mui/material';
import { FiDownload, FiShare2, FiCompass, FiFolderPlus } from 'react-icons/fi';
import api from '../../Services/api';
import API_BASE_URL, { API_ENDPOINTS } from '../../config/api.config';
import LazyLoadImage2 from '../LazyLoadImage2/LazyLoadImage2';
import BackBtnCompo from '../BackBtnCompo/BackBtnCompo';
import './AssetDetailView.css';

function AssetDetailView() {
    const { userData } = useGlobalState();
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [owner, setOwner] = useState(null);
    const [related, setRelated] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // NEW: download modal state
    const [downloadTarget, setDownloadTarget] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

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

    const slugify = useCallback(
        (val) => {
            const base = normalize(val || '');
            if (!base) return '';
            return base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        },
        [normalize]
    );

    const buildAssetUrl = useCallback(
        (item) => {
            if (!item) return '/';
            const categorySlug = slugify(getCategoryName(item.category));
            const subSlug = slugify(getSubcategoryName(item.subcategory));
            const subSubSlug = slugify(getSubSubcategoryName(item.subsubcategory));
            const segments = ['/asset'];
            if (categorySlug) segments.push(categorySlug);
            if (subSlug) segments.push(subSlug);
            if (subSubSlug) segments.push(subSubSlug);
            if (item._id) segments.push(item._id);
            return segments.join('/');
        },
        [slugify, getCategoryName, getSubcategoryName, getSubSubcategoryName]
    );

    // Helper: extract extension from URL
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

    // Build ordered list of variants for any item (asset or related)
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
                fileSize: item.fileMetadata?.fileSize || null,
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

    const isVideo = useMemo(() => {
        if (!asset) return false;
        const cat = normalize(getCategoryName(asset.category) || '');
        if (cat === 'video' || cat === 'videos') return true;
        const url = asset.imageUrl || '';
        return /\.mp4$|\.mov$|\.m4v$|\.webm$/i.test(url);
    }, [asset, normalize, getCategoryName]);

    useEffect(() => {
        let isMounted = true;
        const fetchAsset = async () => {
            setLoading(true);
            setError('');
            try {
                // Only load images; do not call /creators here
                const imagesRes = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
                const all = imagesRes.data?.data || [];

                const approved = all.filter(
                    (item) => item.approved === true && item.rejected !== true
                );

                const found = approved.find((item) => item._id === id);
                if (!found) {
                    if (isMounted) {
                        setError('Asset not found');
                        setAsset(null);
                        setOwner(null);
                        setRelated([]);
                    }
                    return;
                }

                // Related = all other approved items from the same creator
                const relatedItems = approved
                    .filter(
                        (item) =>
                            item._id !== id &&
                            item.creatorId &&
                            found.creatorId &&
                            String(item.creatorId) === String(found.creatorId)
                    )
                    .slice(0, 12);

                if (isMounted) {
                    setAsset(found);
                    // Without /creators, we can't resolve owner info yet; keep Unknown creator
                    setOwner(null);
                    setRelated(relatedItems);
                }
            } catch (err) {
                console.error('Error loading asset detail', err);
                if (isMounted) setError('Something went wrong');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAsset();

        // Follow state still depends on owner; will be inactive until backend exposes creator/user
        const fetchFollowState = async () => {
            if (!owner?._id || !userData?._id) return;
            try {
                const res = await api.get(API_ENDPOINTS.GET_FOLLOWERS(owner._id));
                setFollowersCount(res.data?.length || 0);
                setIsFollowing(res.data?.some((f) => f.followerUser === userData._id));
            } catch {
                setFollowersCount(0);
                setIsFollowing(false);
            }
        };
        fetchFollowState();

        return () => {
            isMounted = false;
        };
    }, [id, userData?._id, owner?._id]);

    // Follow/unfollow handlers
    const handleFollow = async () => {
        if (!userData?._id || !owner?._id) return;
        setFollowLoading(true);
        try {
            await api.post(API_ENDPOINTS.FOLLOW, { followerId: userData._id, followingId: owner._id });
            setIsFollowing(true);
            setFollowersCount(c => c + 1);
        } catch (e) {
            // Optionally show error
        } finally {
            setFollowLoading(false);
        }
    };
    const handleUnfollow = async () => {
        if (!userData?._id || !owner?._id) return;
        setFollowLoading(true);
        try {
            await api.post(API_ENDPOINTS.UNFOLLOW, { followerId: userData._id, followingId: owner._id });
            setIsFollowing(false);
            setFollowersCount(c => Math.max(0, c - 1));
        } catch (e) {
            // Optionally show error
        } finally {
            setFollowLoading(false);
        }
    };

    const handleOpenRelated = (item) => {
        if (!item?._id) return;
        navigate(buildAssetUrl(item));
    };

    const handleDiscoverSimilar = () => {
        if (!asset?.category) return;
        navigate(`/collection/${normalize(getCategoryName(asset.category))}`);
    };

    const handleShare = async () => {
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
    };

    // CHANGE: open modal for main asset instead of immediate download
    const handleDownload = () => {
        if (!asset) return;
        setDownloadTarget(asset);
        setShowDownloadModal(true);
    };

    const handleSaveToCollection = () => {
        alert('Save to collection coming soon.');
    };

    // CHANGE: for related items, also open the same modal
    const handleDownloadItem = (item) => {
        if (!item) return;
        setDownloadTarget(item);
        setShowDownloadModal(true);
    };

    const handleShareItem = async (item) => {
        if (!item) return;
        const detailUrl = item._id
            ? `${window.location.origin}${buildAssetUrl(item)}`
            : item.imageUrl || window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: item.title || 'Asset', url: detailUrl });
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
    };

    const handleDiscoverSimilarItem = (item) => {
        if (!item?.category) return;
        navigate(`/collection/${normalize(getCategoryName(item.category))}`);
    };

    // NEW: perform actual variant download through backend proxy
    const handleVariantDownload = (variant, item) => {
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
    };

    if (loading) {
        return (
            <div className="container py-5">
                <Skeleton variant="rectangular" width="100%" height={420} className="mb-4" />
                <div className="d-flex gap-3">
                    {[...Array(4)].map((_, idx) => (
                        <Skeleton key={idx} variant="rectangular" width="100%" height={220} />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !asset) {
        return (
            <div className="container py-5">
                <BackBtnCompo />
                <p className="mt-4 text-danger fw-semibold">{error || 'Asset not found'}</p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <BackBtnCompo />

            <div className="asset-hero card shadow-sm border-0 overflow-hidden rounded-4 my-4">
                <div className="asset-hero__media">
                    {isVideo ? (
                        <video src={asset.imageUrl} controls className="asset-hero__media-el" />
                    ) : (
                        <img
                            src={asset.imageUrl}
                            alt={asset.title || getSubcategoryName(asset.subcategory) || 'Asset'}
                            className="asset-hero__media-el"
                        />
                    )}

                    <div className="asset-hero__actions">
                        <button className="action-btn" type="button" aria-label="Discover similar" onClick={handleDiscoverSimilar}>
                            <FiCompass size={18} />
                        </button>
                        <button className="action-btn" type="button" aria-label="Save to collection" onClick={handleSaveToCollection}>
                            <FiFolderPlus size={18} />
                        </button>
                        <button className="action-btn" type="button" aria-label="Share" onClick={handleShare}>
                            <FiShare2 size={18} />
                        </button>
                        <button className="action-btn" type="button" aria-label="Download" onClick={handleDownload}>
                            <FiDownload size={18} />
                        </button>
                    </div>
                </div>

                <div className="asset-hero__meta p-3">
                    <div className="d-flex align-items-center mb-3">
                        <img
                            src={owner?.profile?.profileImage || 'https://via.placeholder.com/48'}
                            alt={owner?.profile?.displayName || 'author'}
                            className="rounded-circle"
                            style={{ width: 48, height: 48, objectFit: 'cover' }}
                        />
                        <div className="ms-3">
                            <div className="fw-semibold mb-1 d-flex align-items-center" style={{ fontWeight: 500, fontSize: '16px', color: '#333' }}>
                                <span style={{ color: '#888', fontWeight: 400, fontSize: '15px', marginRight: 4 }}>Author:</span>
                                <span style={{ color: '#1a73e8', fontWeight: 600, marginRight: 12 }}>
                                    {owner?.profile?.displayName || 'Unknown creator'}
                                </span>
                                {!!owner?.creatorId && (
                                    <>
                                        <button
                                            className={`btn btn-sm ${isFollowing ? 'btn-outline-primary' : 'btn-primary'}`}
                                            style={{ minWidth: 90, fontWeight: 500, fontSize: 14, marginRight: 8 }}
                                            onClick={isFollowing ? handleUnfollow : handleFollow}
                                            disabled={followLoading}
                                        >
                                            {isFollowing ? 'Unfollow' : 'Follow'}
                                        </button>
                                        <span style={{ color: '#888', fontWeight: 400, fontSize: '14px' }}>
                                            {followersCount} follower{followersCount === 1 ? '' : 's'}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="text-muted" style={{ fontSize: '14px' }}>
                                { [
                                    getCategoryName(asset.category),
                                    getSubcategoryName(asset.subcategory),
                                    getSubSubcategoryName(asset.subsubcategory),
                                ]
                                    .filter(Boolean)
                                    .join(' / ')}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {getSubcategoryName(asset.subcategory) && (
                            <span className="badge bg-light text-dark">{getSubcategoryName(asset.subcategory)}</span>
                        )}
                        {getSubSubcategoryName(asset.subsubcategory) && (
                            <span className="badge bg-light text-dark">{getSubSubcategoryName(asset.subsubcategory)}</span>
                        )}
                        {asset.keywords?.slice(0, 4).map((kw) => (
                            <span key={kw} className="badge bg-secondary-subtle text-dark">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>

            </div>

            {related.length > 0 && (
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-semibold mb-0">More like this</h5>
                        <Link to={`/collection/${normalize(getCategoryName(asset.category))}`}>See all</Link>
                    </div>
                    <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={3} gap={12}>
                        {related.map((item) => (
                            <ImageListItem
                                key={item._id}
                                onClick={() => handleOpenRelated(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="related-card">
                                    {normalize(getCategoryName(item.category)) === 'video' ? (
                                        <video src={item.imageUrl} style={{ width: '100%', borderRadius: 16 }} muted />
                                    ) : (
                                        <LazyLoadImage2
                                            src={item.imageUrl}
                                            alt={getSubcategoryName(item.subcategory) || getCategoryName(item.category)}
                                        />
                                    )}
                                    <div className="related-actions">
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Download"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadItem(item);
                                            }}
                                        >
                                            <FiDownload size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Share"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShareItem(item);
                                            }}
                                        >
                                            <FiShare2 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Discover similar"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDiscoverSimilarItem(item);
                                            }}
                                        >
                                            <FiCompass size={16} />
                                        </button>
                                    </div>
                                </div>
                            </ImageListItem>
                        ))}
                    </ImageList>
                </div>
            )}

            {/* NEW: file size selection modal for main & related assets */}
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
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#555' }}>
                            FILE SIZE
                        </div>
                        {getVariantsForItem(downloadTarget).map((v) => {
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
        </div>
    );
}

export default AssetDetailView;
