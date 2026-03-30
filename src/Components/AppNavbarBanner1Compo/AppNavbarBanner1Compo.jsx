import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { usePublicCategoriesQuery } from '../../query/categoryQueries.js';
import { buildHomepageCategoryEntries } from '../../utils/homepageCategories.js';

function AppNavbarBanner1Compo() {
    const navigate = useNavigate();
    const categoriesQuery = usePublicCategoriesQuery();
    const cards = useMemo(
        () => buildHomepageCategoryEntries(categoriesQuery.data),
        [categoriesQuery.data]
    );
    const [mobileIndex, setMobileIndex] = useState(0);
    const mobileCardRefs = useRef([]);

    useEffect(() => {
        if (!cards.length) {
            setMobileIndex(0);
            return;
        }
        if (mobileIndex >= cards.length) {
            setMobileIndex(0);
        }
    }, [cards.length, mobileIndex]);

    const firstRowCards = cards.slice(0, 5);
    const secondRowCards = cards.slice(5);

    const handleClick = (card) => {
        if (!card?.slug) return;
        navigate(`/collection/${encodeURIComponent(card.slug)}`);
        window.scroll(0, 0);
    };

    const renderCardInner = (card) => (
        <div
            className="h-100 w-100 position-relative overflow-hidden"
            style={{
                borderRadius: 16,
                backgroundImage: `url(${card.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                <h5 className="text-white mb-0" style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {card.cardLabel}
                </h5>
            </div>
        </div>
    );

    const goPrevMobile = () => {
        if (!cards.length) return;
        setMobileIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const goNextMobile = () => {
        if (!cards.length) return;
        setMobileIndex((prev) => (prev + 1) % cards.length);
    };

    useEffect(() => {
        const el = mobileCardRefs.current[mobileIndex];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [mobileIndex]);

    return (
        <div className="asset-type-wrapper">
            <div className="mt-3 px-3 px-md-0 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                <h5 className="text-white fw-semibold mb-1 mb-md-0" style={{ fontSize: '1.05rem' }}>
                    Browse by asset type
                </h5>
                <span className="text-white-50" style={{ fontSize: 12 }}>
                    Videos, images, vectors, PSDs, AI graphics and more
                </span>
            </div>

            <div className="d-none d-md-block px-3 px-md-0 mt-2">
                <div className="d-flex justify-content-center flex-wrap" style={{ gap: 24 }}>
                    {firstRowCards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleClick(card)}
                            style={{ cursor: 'pointer', width: 220, maxWidth: '20rem', flexShrink: 0 }}
                        >
                            <div className="card border-0 h-100" style={{ borderRadius: 18, overflow: 'hidden', minHeight: 150 }}>
                                {renderCardInner(card)}
                            </div>
                        </div>
                    ))}
                </div>

                {!!secondRowCards.length && (
                    <div className="d-flex justify-content-center flex-wrap mt-3" style={{ gap: 24 }}>
                        {secondRowCards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => handleClick(card)}
                                style={{ cursor: 'pointer', width: 220, maxWidth: '20rem', flexShrink: 0 }}
                            >
                                <div className="card border-0 h-100" style={{ borderRadius: 18, overflow: 'hidden', minHeight: 150 }}>
                                    {renderCardInner(card)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="d-flex d-md-none align-items-center justify-content-between mt-3 px-3">
                <button
                    type="button"
                    onClick={goPrevMobile}
                    className="btn btn-sm btn-light border rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32 }}
                    aria-label="Previous asset type"
                >
                    <FiChevronLeft size={16} />
                </button>
                <button
                    type="button"
                    onClick={goNextMobile}
                    className="btn btn-sm btn-light border rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32 }}
                    aria-label="Next asset type"
                >
                    <FiChevronRight size={16} />
                </button>
            </div>
            <div
                className="d-flex d-md-none mt-2 px-3 asset-type-carousel"
                style={{ overflowX: 'auto', gap: 16, scrollSnapType: 'x mandatory' }}
            >
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        ref={(el) => (mobileCardRefs.current[index] = el)}
                        style={{ minWidth: '80%', maxWidth: 320, flexShrink: 0, scrollSnapAlign: 'center' }}
                        onClick={() => handleClick(card)}
                    >
                        <div
                            className="card border-0 shadow-sm"
                            style={{
                                borderRadius: 18,
                                overflow: 'hidden',
                                height: 180,
                                cursor: 'pointer',
                                boxShadow: '0 14px 38px rgba(15,23,42,0.5)',
                                backgroundColor: '#020617',
                            }}
                        >
                            {renderCardInner(card)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AppNavbarBanner1Compo;
