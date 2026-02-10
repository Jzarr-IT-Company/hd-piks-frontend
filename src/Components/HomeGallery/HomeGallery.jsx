import React, { useEffect, useState, useCallback } from 'react';
import { Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../Services/api.js';
import { API_ENDPOINTS } from '../../config/api.config.js';
import '../LazyLoadImage2/LazyLoadImage.css';

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
function GalleryItem({ src, alt, onClick }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className="lazy-image-wrapper"
            style={{ position: 'relative', width: '100%', paddingBottom: '70%', cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
        >
            {!loaded && (
                <div className="lazy-skeleton-overlay">
                    <Skeleton.Image
                        active
                        style={{ width: '100%', height: '100%', borderRadius: 16 }}
                    />
                </div>
            )}
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
        </div>
    );
}

function HomeGallery() {
    const navigate = useNavigate();
    // Tabs: all / Image / Mockups (you can add more later)
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Image' | 'Mockups'

    const parentFilter =
        activeTab === 'all'
            ? undefined
            : activeTab; // sent as parentCategory name to backend

    const { items, loading, error, hasMore, loadMore } = useHomeGallery(parentFilter);

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
                    {['all', 'Image', 'Mockups'].map((tab) => (
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
                                src={asset.imageUrl}
                                alt={asset.title || asset.subcategory || 'Asset'}
                                onClick={() => navigate(buildAssetUrl(asset))}
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
                            {loading ? 'Loading…' : 'Load more'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default HomeGallery;
