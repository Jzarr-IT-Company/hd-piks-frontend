import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { usePublicCategoriesQuery } from '../../query/categoryQueries.js';
import { buildHomepageCategoryEntries } from '../../utils/homepageCategories.js';
import './AppNavbarBanner1Compo.css';

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

    const handleClick = (card) => {
        if (!card?.slug) return;
        navigate(`/collection/${encodeURIComponent(card.slug)}`);
        window.scroll(0, 0);
    };

    const renderCard = (card, imageHeight = 160) => (
        <div
            className="asset-type-card"
            onClick={() => handleClick(card)}
            style={{ '--asset-type-image-height': `${imageHeight}px` }}
        >
            <div
                className="asset-type-card__image"
                style={{ backgroundImage: `url(${card.src})` }}
            />
            <h5
                className="asset-type-card__title mb-0 text-center"
            >
                {card.cardLabel}
            </h5>
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
        <section className="asset-type-wrapper">
            <div className="container-fluid px-3 px-lg-5">
                <h3 className="asset-type-heading text-center mb-5">
                    Browse by Content Type
                </h3>
            </div>

            <div className="asset-type-grid d-none d-md-grid">
                {cards.map((card) => (
                    <React.Fragment key={card.id}>
                        {renderCard(card)}
                    </React.Fragment>
                ))}
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
                        style={{ minWidth: '78%', maxWidth: 320, flexShrink: 0, scrollSnapAlign: 'center' }}
                    >
                        {renderCard(card, 150)}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default AppNavbarBanner1Compo;
