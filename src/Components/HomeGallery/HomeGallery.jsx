import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCompass, FiDownload, FiFolderPlus, FiShare2 } from 'react-icons/fi';
import CollectionSelectModal from '../CollectionSelectModal';
import { getAllImages } from '../../Services/getImages';
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

    const normalize = useCallback((val = '') => val.trim().toLowerCase(), []);

    const categoryOptions = [
        { label: 'All', value: 'all' },
        { label: 'Images', value: 'image' },
        { label: 'Videos', value: 'video' },
        { label: 'Vectors', value: 'vector' },
        { label: 'PSD', value: 'psd' },
        { label: 'NFTs', value: 'nfts' },
        { label: 'Mockups', value: 'mockups' },
        { label: 'Templates', value: 'templates' },
        { label: 'AI images', value: 'Ai images' },
        { label: 'Icons', value: 'icon' }
    ];

    useEffect(() => {
        let active = true;
        const fetchImages = async () => {
            try {
                const data = await getAllImages();
                if (!active) return;
                const approvedOnly = data.filter((item) => item.approved === true && item.rejected !== true);
                // Sort newest first using createdAt fallback to uploadedAt
                approvedOnly.sort((a, b) => new Date(b.createdAt || b.fileMetadata?.uploadedAt || 0) - new Date(a.createdAt || a.fileMetadata?.uploadedAt || 0));
                setAllItems(approvedOnly);
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
        return () => { active = false; };
    }, []);

    const filterByCategory = (categoryName, source = allItems) => {
        setActiveCategory(categoryName);
        const target = normalize(categoryName);
        if (target === 'all') {
            setItems(source.slice(0, 24));
            return;
        }
        const filtered = source.filter((item) => normalize(item.category || '') === target);
        setItems(filtered.slice(0, 24));
    };

    const isVideoItem = useCallback((item) => {
        const cat = normalize(item?.category || '');
        if (cat === 'video' || cat === 'videos') return true;
        const url = item?.imageUrl || '';
        return /\.(mp4|mov|m4v|webm)$/i.test(url);
    }, [normalize]);

    const handleOpenAsset = (item) => {
        if (item?._id) {
            navigate(`/asset/${item._id}`);
            return;
        }
        if (item?.imageUrl) {
            window.open(item.imageUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleDiscoverSimilar = (event, item) => {
        event.stopPropagation();
        if (!item?.category) return;
        navigate(`/collection/${normalize(item.category)}`);
    };

    const handleShare = async (event, item) => {
        event.stopPropagation();
        const detailUrl = item?._id
            ? `${window.location.origin}/asset/${item._id}`
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

    const handleDownload = (event, item) => {
        event.stopPropagation();
        if (!item?.imageUrl) return;
        const link = document.createElement('a');
        link.href = item.imageUrl;
        link.download = item.title || 'asset';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleSaveToCollection = (event, assetId) => {
        event.stopPropagation();
        console.log('HomeGallery: Selected assetId for collection:', assetId);
        setSelectedAssetId(assetId);
        setShowCollectionModal(true);
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
                        className={`home-gallery__filter ${activeCategory === cat.value ? 'home-gallery__filter--active' : ''}`}
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
    </section>
    );
}

export default HomeGallery;
