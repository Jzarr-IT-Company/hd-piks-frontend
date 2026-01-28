import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useGlobalState } from '../../Context/Context';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ImageList, ImageListItem, Skeleton } from '@mui/material';
import { FiDownload, FiShare2, FiCompass, FiFolderPlus } from 'react-icons/fi';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { getAllCreatorsData } from '../../Services/creator';
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

    const normalize = useCallback((val = '') => val.trim().toLowerCase(), []);

    const isVideo = useMemo(() => {
        if (!asset) return false;
        const cat = normalize(asset.category || '');
        if (cat === 'video' || cat === 'videos') return true;
        const url = asset.imageUrl || '';
        return /\.mp4$|\.mov$|\.m4v$|\.webm$/i.test(url);
    }, [asset, normalize]);

    // Fetch asset, owner, related, and follow state
    useEffect(() => {
        let isMounted = true;
        const fetchAsset = async () => {
            setLoading(true);
            setError('');
            try {
                const [imagesRes, creators] = await Promise.all([
                    api.get(API_ENDPOINTS.GET_ALL_IMAGES),
                    getAllCreatorsData()
                ]);

                const all = imagesRes.data?.data || [];
                const approved = all.filter((item) => item.approved === true && item.rejected !== true);
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

                const ownerMatch = creators.find((c) => c._id === found.creatorId) || null;
                const relatedItems = approved
                    .filter((item) => item._id !== id && normalize(item.category) === normalize(found.category))
                    .filter((item) => !found.subcategory || normalize(item.subcategory || '') === normalize(found.subcategory || ''))
                    .slice(0, 12);

                if (isMounted) {
                    setAsset(found);
                    setOwner(ownerMatch);
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
        // Fetch followers count and follow state
        const fetchFollowState = async () => {
            if (!owner?._id || !userData?._id) return;
            try {
                // Get followers list for this creator
                const res = await api.get(API_ENDPOINTS.GET_FOLLOWERS(owner._id));
                setFollowersCount(res.data?.length || 0);
                // Check if current user is following
                setIsFollowing(res.data?.some(f => f.followerUser === userData._id));
            } catch (e) {
                setFollowersCount(0);
                setIsFollowing(false);
            }
        };
        fetchFollowState();
        return () => {
            isMounted = false;
        };
    }, [id, normalize, owner?._id, userData?._id]);
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

    const handleOpenRelated = (relatedId) => {
        navigate(`/asset/${relatedId}`);
    };

    const handleDiscoverSimilar = () => {
        if (!asset?.category) return;
        navigate(`/collection/${normalize(asset.category)}`);
    };

    const handleShare = async () => {
        const detailUrl = asset?._id
            ? `${window.location.origin}/asset/${asset._id}`
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

    const handleDownload = () => {
        if (!asset?.imageUrl) return;
        const link = document.createElement('a');
        link.href = asset.imageUrl;
        link.download = asset.title || 'asset';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleSaveToCollection = () => {
        alert('Save to collection coming soon.');
    };

    const handleDownloadItem = (item) => {
        if (!item?.imageUrl) return;
        const link = document.createElement('a');
        link.href = item.imageUrl;
        link.download = item.title || 'asset';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleShareItem = async (item) => {
        if (!item) return;
        const detailUrl = item._id
            ? `${window.location.origin}/asset/${item._id}`
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
        navigate(`/collection/${normalize(item.category)}`);
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
                        <img src={asset.imageUrl} alt={asset.title || asset.subcategory || 'Asset'} className="asset-hero__media-el" />
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

                    {/* <button className="discover-btn" type="button" onClick={handleDiscoverSimilar}>
                        <FiCompass size={16} className="me-2" /> Discover similar
                    </button> */}
                    
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
                                <span style={{ color: '#1a73e8', fontWeight: 600, marginRight: 12 }}>{owner?.profile?.displayName || 'Unknown creator'}</span>
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
                                {[asset.category, asset.subcategory, asset.subsubcategory].filter(Boolean).join(' / ')}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {asset.subcategory && <span className="badge bg-light text-dark">{asset.subcategory}</span>}
                        {asset.subsubcategory && <span className="badge bg-light text-dark">{asset.subsubcategory}</span>}
                        {asset.keywords?.slice(0, 4).map((kw) => (
                            <span key={kw} className="badge bg-secondary-subtle text-dark">{kw}</span>
                        ))}
                    </div>
                </div>

            </div>

            {related.length > 0 && (
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-semibold mb-0">More like this</h5>
                        <Link to={`/collection/${normalize(asset.category)}`}>See all</Link>
                    </div>
                    <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={3} gap={12}>
                        {related.map((item) => (
                            <ImageListItem key={item._id} onClick={() => handleOpenRelated(item._id)} style={{ cursor: 'pointer' }}>
                                <div className="related-card">
                                    {normalize(item.category) === 'video' ? (
                                        <video src={item.imageUrl} style={{ width: '100%', borderRadius: 16 }} muted />
                                    ) : (
                                        <LazyLoadImage2 src={item.imageUrl} alt={item.subcategory || item.category} />
                                    )}
                                    <div className="related-actions">
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Download"
                                            onClick={(e) => { e.stopPropagation(); handleDownloadItem(item); }}
                                        >
                                            <FiDownload size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Share"
                                            onClick={(e) => { e.stopPropagation(); handleShareItem(item); }}
                                        >
                                            <FiShare2 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Discover similar"
                                            onClick={(e) => { e.stopPropagation(); handleDiscoverSimilarItem(item); }}
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
        </div>

    );
    

}


export default AssetDetailView;
