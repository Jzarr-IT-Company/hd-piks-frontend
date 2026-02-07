import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCompass, FiDownload, FiFolderPlus, FiShare2 } from 'react-icons/fi';
import CollectionSelectModal from '../CollectionSelectModal';
import { getAllImages } from '../../Services/getImages';
import API_BASE_URL from '../../config/api.config';
import './HomeGallery.css';

function HomeGallery() {
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const navigate = useNavigate();
    const [allItems, setAllItems] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [categoryOptions, setCategoryOptions] = useState([
        { label: 'All', value: 'all' },
    ]);
    const [downloadTarget, setDownloadTarget] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const normalize = useCallback((val) => {
        if (typeof val === 'string') {
            return val.trim().toLowerCase();
        }
        if (val == null) {
            return '';
        }
        return String(val).trim().toLowerCase();
    }, []);

    const getCategoryName = (cat) => {
        if (!cat) return '';
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object') {
            // populated document: { _id, name, parent, ... }
            return cat.name || '';
        }
        return String(cat);
    };

    const getSubcategoryName = (sub) => {
        if (!sub) return '';
        if (typeof sub === 'string') return sub;
        if (typeof sub === 'object') return sub.name || '';
        return String(sub);
    };

    const getSubSubcategoryName = (subsub) => {
        if (!subsub) return '';
        if (typeof subsub === 'string') return subsub;
        if (typeof subsub === 'object') return subsub.name || '';
        return String(subsub);
    };

    const slugify = useCallback(
        (val) => {
            const base = normalize(val || '');
            if (!base) return '';
            return base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        },
        [normalize]
    );

    const capitalizeLabel = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    useEffect(() => {
        let active = true;
        const fetchImages = async () => {
            try {
                const data = await getAllImages();
                if (!active) return;

                const approvedOnly = data.filter(
                    (item) => item.approved === true && item.rejected !== true
                );

                // Sort newest first using createdAt fallback to uploadedAt
                approvedOnly.sort(
                    (a, b) =>
                        new Date(b.createdAt || b.fileMetadata?.uploadedAt || 0) -
                        new Date(a.createdAt || a.fileMetadata?.uploadedAt || 0)
                );

                setAllItems(approvedOnly);

                // Build dynamic category options from data (using category name)
                const uniqueCats = Array.from(
                    new Set(
                        approvedOnly
                            .map((item) => normalize(getCategoryName(item.category)))
                            .filter((v) => v && v !== 'all')
                    )
                );

                setCategoryOptions([
                    { label: 'All', value: 'all' },
                    ...uniqueCats.map((val) => ({
                        value: val,
                        label: capitalizeLabel(val),
                    })),
                ]);

                filterByCategory('all', approvedOnly);
                setError(approvedOnly.length ? '' : 'No approved items yet.');
            } catch (err) {
                if (!active) return;
                setAllItems([]);
                filterByCategory('all', []);
                setError('Could not load images right now.');
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchImages();
        return () => {
            active = false;
        };
    }, [normalize]);

    const filterByCategory = (categoryName, source = allItems) => {
        setActiveCategory(categoryName);
        const target = normalize(categoryName);
        if (target === 'all') {
            setItems(source.slice(0, 24));
            return;
        }
        const filtered = source.filter(
            (item) => normalize(getCategoryName(item.category)) === target
        );
        setItems(filtered.slice(0, 24));
    };

    const isVideoItem = useCallback(
        (item) => {
            const cat = normalize(getCategoryName(item?.category || ''));
            if (cat === 'video' || cat === 'videos') return true;
            const url = item?.imageUrl || '';
            return /\.(mp4|mov|m4v|webm)$/i.test(url);
        },
        [normalize]
    );

    const buildAssetUrl = (item) => {
        const categorySlug = slugify(getCategoryName(item.category));
        const subSlug = slugify(getSubcategoryName(item.subcategory));
        const subSubSlug = slugify(getSubSubcategoryName(item.subsubcategory));
        const segments = ['/asset'];
        if (categorySlug) segments.push(categorySlug);
        if (subSlug) segments.push(subSlug);
        if (subSubSlug) segments.push(subSubSlug);
        if (item._id) segments.push(item._id);
        return segments.join('/');
    };

    const handleOpenAsset = (item) => {
        if (item?._id) {
            navigate(buildAssetUrl(item));
            return;
        }
        if (item?.imageUrl) {
            window.open(item.imageUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleDiscoverSimilar = (event, item) => {
        event.stopPropagation();
        const catName = getCategoryName(item?.category);
        if (!catName) return;
        navigate(`/collection/${normalize(catName)}`);
    };

    const handleShare = async (event, item) => {
        event.stopPropagation();
        const detailUrl = item?._id
            ? `${window.location.origin}${buildAssetUrl(item)}`
            : item?.imageUrl || window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: item?.title || 'Asset', url: detailUrl });
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

    const getExtensionFromUrl = useCallback((url) => {
        if (!url) return '';
        try {
            const u = new URL(url);
            const pathname = u.pathname || '';
            const dotIndex = pathname.lastIndexOf('.');
            if (dotIndex === -1) return '';
            return pathname.substring(dotIndex); // includes dot
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

        // Fallback: no mediaVariants -> single original from main imageUrl/fileMetadata
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

    const handleDownload = (event, item) => {
        event.stopPropagation();
        if (!item) return;
        setDownloadTarget(item);
        setShowDownloadModal(true);
    };

    const handleVariantDownload = (variant, item) => {
        if (!variant || !variant.url) return;

        const label = variant.variant
            ? variant.variant.charAt(0).toUpperCase() + variant.variant.slice(1)
            : 'Original';

        const w = variant.dimensions?.width;
        const h = variant.dimensions?.height;
        const sizeSuffix = w && h ? `-${w}x${h}px` : '';
        const baseName = (item?.title || 'asset').toString().replace(/[^\w.-]+/g, '-');
        const ext = getExtensionFromUrl(variant.url) || ''; // <-- ensure extension
        const fileName = `${baseName}-${label}${sizeSuffix}${ext}`;

        let href = variant.url;

        // If we know the S3 key, go through backend proxy to force download
        if (variant.s3Key) {
            const params = new URLSearchParams();
            params.set('key', variant.s3Key);
            params.set('filename', fileName);
            href = `${API_BASE_URL}/download?${params.toString()}`;
        }

        const link = document.createElement('a');
        link.href = href;
        // download attribute may be ignored cross-origin, but works for same-origin (/download)
        link.download = fileName;
        link.rel = 'noopener noreferrer';

        document.body.appendChild(link);
        link.click();
        link.remove();

        setShowDownloadModal(false);
        setDownloadTarget(null);
    };

    const handleSaveToCollection = (event, assetId) => {
        event.stopPropagation();
        setSelectedAssetId(assetId);
        setShowCollectionModal(true);
    };

    // Gradient pill styles (same as other buttons)
    const pillBaseStyle = {
        borderRadius: 999,
        fontSize: 13,
        padding: "6px 18px",
        border: "1px solid #020617",
        backgroundColor: "#020617",
        color: "#ffffff",
    };
    const pillActiveStyle = {
        borderRadius: 999,
        fontSize: 13,
        padding: "6px 18px",
        background: "linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))",
        color: "#ffffff",
        border: "1px solid rgb(143, 92, 255)",
        boxShadow: "0 1px 3px rgba(15,23,42,0.25)",
    };

    return (
        <section className="home-gallery">
            <div className="home-gallery__head">
                <div>
                    
                    <h3 className="home-gallery__title">Free Stock Photos</h3>
                    <p className="home-gallery__sub">Browse newly items. Click to preview or download.</p>
                </div>
                <div className="home-gallery__status">
                    {loading && <span className="home-gallery__pill">Loading…</span>}
                    {error && <span className="home-gallery__pill home-gallery__pill--error">{error}</span>}
                    {!loading && <span className="home-gallery__pill">{items.length} items</span>}
                </div>
            </div>

            <div className="home-gallery__filters">
                {categoryOptions.map((cat) => (
                    <button
                        key={cat.value}
                        type="button"
                        className={`home-gallery__filter ${
                            activeCategory === cat.value
                                ? 'home-gallery__filter--active'
                                : ''
                        }`}
                        style={
                            activeCategory === cat.value
                                ? pillActiveStyle
                                : pillBaseStyle
                        }
                        onClick={() => filterByCategory(cat.value)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="home-gallery__loading">Loading items…</div>
            ) : (
                <>
                    {error && <div className="home-gallery__error">{error}</div>}
                    {items.length === 0 ? (
                        <div className="home-gallery__empty">
                            <div>No Images Found</div>
                            <a className="home-gallery__more" href="/collections">View More</a>
                        </div>
                    ) : (
                        <div className="home-gallery__grid">
                            {items.map((item) => (
                                <article
                                    className="home-gallery__card"
                                    key={item._id || item.imageUrl}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleOpenAsset(item)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleOpenAsset(item); }}
                                >
                                    <div className="home-gallery__thumb">
                                        {isVideoItem(item) ? (
                                            <video
                                                src={item.imageUrl}
                                                muted
                                                loop
                                                playsInline
                                                autoPlay
                                                onMouseEnter={(e) => e.target.play()}
                                                onMouseLeave={(e) => e.target.pause()}
                                            />
                                        ) : (
                                            <img src={item.imageUrl} alt={item.title || 'Resource preview'} loading="lazy" />
                                        )}
                                        <div className="home-gallery__hover-actions">
                                            <button
                                                type="button"
                                                className="home-gallery__icon-btn"
                                                title="Discover similar"
                                                onClick={(e) => handleDiscoverSimilar(e, item)}
                                            >
                                                <FiCompass size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="home-gallery__icon-btn"
                                                title="Save to collection"
                                                onClick={e => handleSaveToCollection(e, item._id)}
                                            >
                                                <FiFolderPlus size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="home-gallery__icon-btn"
                                                title="Share"
                                                onClick={(e) => handleShare(e, item)}
                                            >
                                                <FiShare2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="home-gallery__icon-btn"
                                                title="Download"
                                                onClick={(e) => handleDownload(e, item)}
                                            >
                                                <FiDownload size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Meta intentionally hidden per request */}
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
            <CollectionSelectModal
                show={showCollectionModal}
                onClose={() => setShowCollectionModal(false)}
                assetId={selectedAssetId}
                onSuccess={() => {
                    // Optionally show a toast or feedback
                }}
            />

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
                            const label =
                                v.variant.charAt(0).toUpperCase() + v.variant.slice(1);
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
        </section>
    );
}

export default HomeGallery;
