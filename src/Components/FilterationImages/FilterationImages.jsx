import { ImageList, ImageListItem, Skeleton } from '@mui/material';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FiCompass, FiDownload, FiFolderPlus, FiShare2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { getAllImages, getImagesByCreatorId } from '../../Services/getImages';
import api from '../../Services/api';
import API_BASE_URL, { API_ENDPOINTS } from '../../config/api.config';
import LazyLoadImage2 from '../LazyLoadImage2/LazyLoadImage2';
import './FilterationImages.css';

function FilterationImages({
    name,
    presetSubcategory,
    creatorId = undefined,
    searchSubcategory = undefined,
    subSubcategoryNames = [],
    searchSubSubcategory = undefined,
    collectionAssetIds = undefined,   // NEW: limit to these asset IDs
}) {
    const [imagesdata, setImagesdata] = useState([]);
    const [creatorData, setCreatorData] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeSubcategory, setActiveSubcategory] = useState('all');
    const [activeSubsubcategory, setActiveSubsubcategory] = useState('all');
    const navigate = useNavigate();
    const [downloadTarget, setDownloadTarget] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const isSearchMode = !!searchSubcategory;

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

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // 1) Load images (main data)
            const images = creatorId
                ? await getImagesByCreatorId(creatorId)
                : await getAllImages();

            // Only approved images
            const approved = images.filter((item) => item.approved === true && item.rejected !== true);

            // If a curated collection is selected, restrict to its assetIds
            let base = approved;
            if (Array.isArray(collectionAssetIds) && collectionAssetIds.length) {
                const idSet = new Set(collectionAssetIds.map(String));
                base = approved.filter((item) => idSet.has(String(item._id)));
            }

            // Filter by main category name (string or populated object)
            let filtered = name
                ? base.filter((item) => normalize(getCategoryName(item.category)) === normalize(name))
                : base;

            // Restrict to searched subcategory when in search mode
            if (searchSubcategory) {
                const targetSub = normalize(searchSubcategory);
                filtered = filtered.filter(
                    (item) => normalize(getSubcategoryName(item.subcategory)) === targetSub
                );
            }

            // Restrict to specific sub‑subcategory if provided
            if (searchSubSubcategory) {
                const targetSubSub = normalize(searchSubSubcategory);
                filtered = filtered.filter(
                    (item) => normalize(getSubSubcategoryName(item.subsubcategory)) ===
                    targetSubSub
                );
            }

            // Newest first using createdAt or uploadedAt fallback.
            filtered.sort(
                (a, b) =>
                    new Date(b.createdAt || b.fileMetadata?.uploadedAt || 0) -
                    new Date(a.createdAt || a.fileMetadata?.uploadedAt || 0)
            );
            setImagesdata(filtered);
            setActiveSubcategory('all');
            setActiveSubsubcategory('all');

            // 2) Load creators per unique creatorId using GET_CREATOR_BY_ID
            const ids = Array.from(
                new Set(
                    filtered
                        .map(img => img.creatorId && (img.creatorId.$oid || img.creatorId))
                        .filter(Boolean)
                )
            );

            const creatorsMap = {};
            await Promise.all(
                ids.map(async (idStr) => {
                    try {
                        const res = await api.get(API_ENDPOINTS.GET_CREATOR_BY_ID(idStr));
                        if (res.data?.data) {
                            creatorsMap[idStr] = res.data.data;
                        }
                    } catch (err) {
                        if (err.response?.status === 404) {
                            // Backend route /creators/:id not implemented or wrong path.
                            // Frontend will fall back to "Unknown Creator".
                            console.warn('[FilterationImages] Creator not found for id', idStr);
                        } else {
                            console.error('[FilterationImages] Failed to load creator', idStr, err);
                        }
                    }
                })
            );
            setCreatorData(creatorsMap);
        } catch (error) {
            console.error('Server error', error.message);
            setImagesdata([]);
            setCreatorData({});
        } finally {
            setLoading(false);
        }
    }, [name, normalize, creatorId, getCategoryName, getSubcategoryName, getSubSubcategoryName, searchSubcategory, searchSubSubcategory, collectionAssetIds]);

    useEffect(() => {
        if (!loading) {
            console.log('[FilterationImages] Rendering imagesdata:', imagesdata);
        }
    }, [imagesdata, loading]);

    const debouncedFetchData = useMemo(() => debounce(fetchData, 500), [fetchData]);

    useEffect(() => {
        debouncedFetchData();
        return () => {
            debouncedFetchData.cancel();
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

    const getColumns = useMemo(() => {
        const width = window.innerWidth;
        if (width < 567) return 2;
        if (width < 900) return 3;
        return 4;
    }, []);

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
        navigate(`/collection/${normalize(catName)}`);
    }, [navigate, normalize, getCategoryName]);

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
        setDownloadTarget(img);
        setShowDownloadModal(true);
    }, []);

    // NEW: download the selected variant via backend proxy
    const handleVariantDownload = useCallback((variant, img) => {
        if (!variant || !variant.url) return;

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

    const handleSaveToCollection = useCallback((event) => {
        event.stopPropagation();
        alert('Save to collection coming soon.');
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

    // NEW: handle subcategory pill click
    const handleSubcategoryPillClick = useCallback(
        (subcat) => {
            if (isSearchMode) {
                // In search context: reset to that subcategory (show all wallpapers, etc.)
                navigate(`/search/${encodeURIComponent(subcat)}`);
            } else {
                // In normal category page: local filter by subcategory
                setActiveSubcategory(subcat);
            }
        },
        [isSearchMode, navigate]
    );

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
        <div className="container">
            {/* Row 1: category + subcategory pills */}
            <div
                className="d-flex flex-wrap align-items-center gap-2 mb-3 justify-content-center justify-content-md-start"
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
                        onClick={() => setActiveSubcategory('all')}
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
                        .map(([subcat, items]) => {
                            // NEW: when a style (sub‑subcategory) filter is active, use it as heading
                            const sectionTitle =
                                isSearchMode && searchSubSubcategory ? searchSubSubcategory : subcat;
                            return (
                                <div key={subcat} className="mb-4 w-100">
                                    <h5 className="fw-semibold mb-2 text-capitalize">{sectionTitle}</h5>
                                    <ImageList
                                        sx={{ width: '100%', height: 'auto' }}
                                        variant="masonry"
                                        cols={getColumns}
                                        gap={8}
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
                                                        <LazyLoadImage2
                                                            src={img.imageUrl}
                                                            alt={
                                                                getSubcategoryName(img.subcategory) ||
                                                                getCategoryName(img.category) ||
                                                                getSubSubcategoryName(img.subsubcategory)
                                                            }
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
                            );
                        })}
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
        </div>
    );
}

export default React.memo(FilterationImages);
