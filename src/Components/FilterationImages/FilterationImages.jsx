import { ImageList, ImageListItem, Skeleton } from '@mui/material';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FiCompass, FiDownload, FiFolderPlus, FiShare2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { getAllImages, getImagesByCreatorId } from '../../Services/getImages';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import LazyLoadImage2 from '../LazyLoadImage2/LazyLoadImage2';
import './FilterationImages.css';

function FilterationImages({ name, presetSubcategory, creatorId = undefined }) {
    const [imagesdata, setImagesdata] = useState([]);
    const [creatorData, setCreatorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSubcategory, setActiveSubcategory] = useState('all');
    const [activeSubsubcategory, setActiveSubsubcategory] = useState('all');
    const navigate = useNavigate();
    const normalize = useCallback((val = '') => val.trim().toLowerCase(), []);
    // Collect all unique subcategories for the current category only
    const subcategories = useMemo(() => {
        const set = new Set();
        imagesdata.forEach(img => {
            if (normalize(img.category) === normalize(name) && img.subcategory) {
                set.add(img.subcategory.trim());
            }
        });
        return Array.from(set);
    }, [imagesdata, name, normalize]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [images, creators] = await Promise.all([
                creatorId ? getImagesByCreatorId(creatorId) : getAllImages(),
                api.get(API_ENDPOINTS.GET_ALL_CREATORS).then(res => res.data?.data || [])
            ]);
            setCreatorData(creators);
            // Only approved images
            const approved = images.filter((item) => item.approved === true && item.rejected !== true);
            // Debug: log all categories and imagetypes in approved images
            console.log('[FilterationImages] Approved:', approved);
            const allCategories = approved.map(i => i.category);
            const allImageTypes = approved.map(i => i.imagetype);
            console.log('[FilterationImages] Categories in approved:', allCategories);
            console.log('[FilterationImages] ImageTypes in approved:', allImageTypes);
            // Filter by category if name is provided
            const filtered = name ? approved.filter((item) => normalize(item.category) === normalize(name)) : approved;
            console.log('[FilterationImages] Filtered:', filtered);
            console.log('[FilterationImages] Creators:', creators);
            // Newest first using createdAt or uploadedAt fallback.
            filtered.sort((a, b) => new Date(b.createdAt || b.fileMetadata?.uploadedAt || 0) - new Date(a.createdAt || a.fileMetadata?.uploadedAt || 0));
            setImagesdata(filtered);
            setActiveSubcategory('all');
            setActiveSubsubcategory('all');
        } catch (error) {
            console.error('Server error', error.message);
            setImagesdata([]);
        } finally {
            setLoading(false);
        }
    }, [name, normalize, creatorId]);
    // Debug log for what is being rendered
    useEffect(() => {
        if (!loading) {
            console.log('[FilterationImages] Rendering imagesdata:', imagesdata);
        }
    }, [imagesdata, loading]);

    // Debounced fetchData
    const debouncedFetchData = useMemo(() => debounce(fetchData, 500), [fetchData]);

    useEffect(() => {
        debouncedFetchData(); // Use the debounced function
        return () => {
            debouncedFetchData.cancel(); // Cleanup debounce on unmount
        };
    }, [name, debouncedFetchData]);

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

    // Calculate number of columns based on screen width
    const getColumns = useMemo(() => {
        const width = window.innerWidth;
        if (width < 567) return 2;
        if (width < 900) return 3;
        return 4;
    }, []);

    // Handle image click (memoized to prevent unnecessary re-renders)
    const handleImageClick = useCallback((imageId) => {
        navigate(`/asset/${imageId}`);
    }, [navigate]);

    const handleDiscoverSimilar = useCallback((event, img) => {
        event.stopPropagation();
        if (!img?.category) return;
        navigate(`/collection/${normalize(img.category)}`);
    }, [navigate, normalize]);

    const handleShare = useCallback(async (event, img) => {
        event.stopPropagation();
        const detailUrl = img?._id
            ? `${window.location.origin}/asset/${img._id}`
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
    }, []);

    const handleDownload = useCallback((event, img) => {
        event.stopPropagation();
        if (!img?.imageUrl) return;
        const link = document.createElement('a');
        link.href = img.imageUrl;
        link.download = img.title || 'asset';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }, []);

    const handleSaveToCollection = useCallback((event) => {
        event.stopPropagation();
        alert('Save to collection coming soon.');
    }, []);

    // Calculate number of skeletons based on the data length
    const skeletonCount = imagesdata.length > 0 ? imagesdata.length : 6;

    const subcategoryBuckets = useMemo(() => {
        const buckets = {};
        imagesdata.forEach((item) => {
            const sub = item.subcategory?.trim() || 'Uncategorized';
            const subsub = item.subsubcategory?.trim();
            if (!buckets[sub]) {
                buckets[sub] = { items: [], subsubs: new Set() };
            }
            buckets[sub].items.push(item);
            if (subsub) buckets[sub].subsubs.add(subsub);
        });
        return buckets;
    }, [imagesdata]);

    const filteredGroups = useMemo(() => {
        const groups = [];
        Object.entries(subcategoryBuckets).forEach(([sub, bucket]) => {
            if (activeSubcategory !== 'all' && sub !== activeSubcategory) return;
            const scopedItems = bucket.items.filter((item) => {
                if (activeSubsubcategory !== 'all') {
                    return (item.subsubcategory || '').trim() === activeSubsubcategory;
                }
                return true;
            });
            if (scopedItems.length) {
                groups.push([sub, scopedItems]);
            }
        });
        return groups;
    }, [subcategoryBuckets, activeSubcategory, activeSubsubcategory]);

    // Memoized creator data rendering to avoid unnecessary recalculations
    const renderImages = useMemo(() => {
        return imagesdata.map((img) => {
            // Handle both string and object id formats
            const imgCreatorId = typeof img.creatorId === 'object' && img.creatorId.$oid ? img.creatorId.$oid : img.creatorId;
            const creator = creatorData.find((item) => {
                const creatorId = typeof item._id === 'object' && item._id.$oid ? item._id.$oid : item._id;
                return creatorId === imgCreatorId;
            });
            return (
                <ImageListItem key={img._id} onClick={() => handleImageClick(img._id)}>
                    <div className="card card-container rounded-4">
                        {img.imagetype && img.imagetype.startsWith('video/') ? (
                            <video
                                src={img.imageUrl}
                                controls
                                style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px' }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <LazyLoadImage2
                                src={img.imageUrl}
                                alt={img.subcategory || img.category || img.subsubcategory}
                                loading="lazy"
                            />
                        )}
                        <div className="card-img-overlay rounded-4 content-hide d-flex flex-column justify-content-end border-danger">
                            <div className="filteration-actions">
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
                                    onClick={handleSaveToCollection}
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
                            </div>
                            <h5 className="mb-2 text-white fw-semibold" style={{ fontSize: "15px" }}>
                                {img.subcategory || img.category || img.subsubcategory}
                            </h5>
                            <div className="d-flex justify-content-between">
                                <div>
                                    {creator && creator.profile && creator.profile.displayName ? (
                                        <span className="mb-0 me-2 text-white fw-bold" style={{ fontSize: "14px" }}>
                                            {creator.profile.displayName}
                                        </span>
                                    ) : (
                                        <span className="mb-0 me-2 text-white" style={{ fontSize: "14px" }}>
                                            Unknown Creator
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ImageListItem>
            );
        });
    }, [imagesdata, creatorData, handleImageClick, handleDiscoverSimilar, handleShare, handleDownload, handleSaveToCollection]);

    // Debug: log filteredGroups and their images
    useEffect(() => {
        if (!loading) {
            const subcategoryBuckets = {};
            imagesdata.forEach((item) => {
                const sub = item.subcategory?.trim() || 'Uncategorized';
                if (!subcategoryBuckets[sub]) subcategoryBuckets[sub] = [];
                subcategoryBuckets[sub].push(item);
            });
            console.log('[FilterationImages] Subcategory Buckets:', subcategoryBuckets);
        }
    }, [imagesdata, loading]);

    return (
        <div className="container">
            {/* Subcategory filter buttons */}
            <div className="d-flex align-items-center mb-3">
                <span className="fw-bold me-2" style={{background: 'linear-gradient(90deg,#8f5cff,#b84592)', color: 'white', padding: '8px 16px', borderRadius: '4px'}}>
                    {`Category/${name ? name.charAt(0).toUpperCase() + name.slice(1) : 'All'}`}
                </span>
                <button
                    className={`btn btn-light btn-sm me-2${activeSubcategory === 'all' ? ' fw-bold' : ''}`}
                    onClick={() => setActiveSubcategory('all')}
                >
                    All subcategories
                </button>
                {subcategories.length === 0 && (
                    <span className="text-muted" style={{fontSize: '14px'}}>No subcategories available</span>
                )}
                {subcategories.map(subcat => (
                    <button
                        key={subcat}
                        className={`btn btn-light btn-sm me-2${activeSubcategory === subcat ? ' fw-bold' : ''}`}
                        onClick={() => setActiveSubcategory(subcat)}
                    >
                        {subcat}
                    </button>
                ))}
            </div>
            {loading ? (
                <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={getColumns} gap={8}>
                    {[...Array(skeletonCount)].map((_, index) => (
                        <ImageListItem key={index}>
                            <Skeleton variant="rectangular" width="100%" height={"200px"} />
                        </ImageListItem>
                    ))}
                </ImageList>
            ) : imagesdata.length === 0 ? (
                <p className="text-capitalize">No data found yet</p>
            ) : (
                <>
                    {filteredGroups
                        .filter(([subcat]) => activeSubcategory === 'all' || subcat === activeSubcategory)
                        .map(([subcat, items]) => (
                        <div key={subcat} className="mb-4 w-100">
                            <h5 className="fw-semibold mb-2 text-capitalize">{subcat}</h5>
                            <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={getColumns} gap={8}>
                                {items.map((img) => {
                                    // Use creator attribution only
                                    const imgCreatorId = typeof img.creatorId === 'object' && img.creatorId.$oid ? img.creatorId.$oid : img.creatorId;
                                    const creator = creatorData.find((item) => {
                                        const creatorId = typeof item._id === 'object' && item._id.$oid ? item._id.$oid : item._id;
                                        return creatorId === imgCreatorId;
                                    });
                                    return (
                                        <ImageListItem key={img._id} onClick={() => handleImageClick(img._id)}>
                                            <div className="card card-container rounded-4">
                                                <LazyLoadImage2
                                                    src={img.imageUrl}
                                                    alt={img.subcategory || img.category || img.subsubcategory}
                                                    loading="lazy"
                                                />
                                                <div className="card-img-overlay rounded-4 content-hide d-flex flex-column justify-content-end">
                                                    <div className="filteration-actions">
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
                                                            onClick={handleSaveToCollection}
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
                                                    </div>
                                                    <h5 className="mb-1 text-white fw-semibold" style={{ fontSize: '15px' }}>
                                                        {img.subcategory || img.category || img.subsubcategory}
                                                    </h5>
                                                    {img.subsubcategory && (
                                                        <span className="badge bg-light text-dark mb-2" style={{ width: 'fit-content' }}>
                                                            {img.subsubcategory}
                                                        </span>
                                                    )}
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            {creator && creator.profile && creator.profile.displayName ? (
                                                                <span className="mb-0 me-2 text-white fw-bold" style={{ fontSize: '14px' }}>
                                                                    {creator.profile.displayName}
                                                                </span>
                                                            ) : (
                                                                <span className="mb-0 me-2 text-white" style={{ fontSize: '14px' }}>
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
                </>
            )}
        </div>
    );
}

export default React.memo(FilterationImages); // Memoize component to avoid unnecessary re-renders
