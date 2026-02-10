// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import videosImg from '../../assets/01_Videos_4K.jpg';
// import imagesImg from '../../assets/02_Images_4K.jpg';
// import vectorImg from '../../assets/03_Vector_4K.jpg';
// import psdImg from '../../assets/04_PSD_4K.jpg';
// import aiImagesImg from '../../assets/05_AI_Images_4K.jpg';
// import templatesImg from '../../assets/06_Templates_4K.jpg';
// import iconsImg from '../../assets/07_Icons_4K.jpg';
// import mockupsImg from '../../assets/08_Mockups_4K.jpg';
// import nftsImg from '../../assets/09_NFTs_4K.jpg';
// const CARDS = [
// 	// From old AppNavbarBanner1Compo
// 	{
// 		id: 'videos',
// 		label: 'Videos',
// 		kind: 'video',
// 		src: videosImg,
// 		target: 'video',
// 	},
// 	{
// 		id: 'images',
// 		label: 'Images',
// 		kind: 'image',
// 		src: imagesImg,
// 		target: 'image',
// 	},
// 	{
// 		id: 'vector',
// 		label: 'Vector',
// 		kind: 'image',
// 		src: vectorImg,
// 		target: 'vector',
// 	},
// 	{
// 		id: 'psd',
// 		label: 'PSD',
// 		kind: 'image',
// 		src: psdImg,
// 		target: 'psd',
// 	},
// 	// From HomeBanner2
// 	{
// 		id: 'ai-images',
// 		label: 'AI images',
// 		kind: 'image',
// 		src: aiImagesImg,
// 		target: 'Ai images',
// 	},
// 	{
// 		id: 'templates',
// 		label: 'Templates',
// 		kind: 'image',
// 		src: templatesImg,
// 		target: 'templates',
// 	},
// 	{
// 		id: 'icons',
// 		label: 'Icons',
// 		kind: 'image',
// 		src: iconsImg,
// 		target: 'icon',
// 	},
// 	{
// 		id: 'mockups',
// 		label: 'Mockups',
// 		kind: 'image',
// 		src: mockupsImg,
// 		target: 'mockups',
// 	},
// 	{
// 		id: 'nfts',
// 		label: 'NFTS',
// 		kind: 'image',
// 		src: nftsImg,
// 		target: 'nfts',
// 	},
// ];

 

// function AppNavbarBanner1Compo() {
// 	const navigate = useNavigate();
// 	const [mobileIndex, setMobileIndex] = useState(0);
// 	const mobileCardRefs = useRef([]);

// 	const handleClick = (card) => {
// 		if (!card?.target) return;
// 		navigate(`/collection/${card.target}`);
// 		window.scroll(0, 0);
// 	};

// 	const renderCardInner = (card) => {
// 		const overlay = (
// 			<>
// 				<div
// 					className="position-absolute top-0 start-0 w-100 h-100"
// 					// style={{
// 					// 	background: 'linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7))',
// 					// }}
// 				/>
// 				<div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
// 					<h5
// 						className="text-white mb-0"
// 						style={{ fontSize: '0.95rem', fontWeight: 600 }}
// 					>
// 						{card.label}
// 					</h5>
// 				</div>
// 			</>
// 		);

// 		if (card.kind === 'video') {
// 			return (
// 				<div className="h-100 w-100 position-relative overflow-hidden" 
// 				 style={{
// 					borderRadius: 16,
// 					backgroundImage: `url(${card.src})`,
// 					backgroundSize: 'cover',
// 					backgroundPosition: 'center',
// 					backgroundRepeat: 'no-repeat',
// 				}}
// 				>
					
// 					{overlay}
// 				</div>
// 			);
// 		}

// 		return (
// 			<div
// 				className="h-100 w-100 position-relative overflow-hidden"
// 				style={{
// 					borderRadius: 16,
// 					backgroundImage: `url(${card.src})`,
// 					backgroundSize: 'cover',
// 					backgroundPosition: 'center',
// 					backgroundRepeat: 'no-repeat',
// 				}}
// 			>
// 				{overlay}
// 			</div>
// 		);
// 	};

// 	// Auto-advance on mobile
// 	useEffect(() => {
// 		if (typeof window === 'undefined') return;
// 		if (window.innerWidth >= 768) return; // only mobile

// 		const interval = setInterval(() => {
// 			setMobileIndex((prev) => (prev + 1) % CARDS.length);
// 		}, 3000);

// 		return () => clearInterval(interval);
// 	}, []);

// 	// Scroll active card into view
// 	useEffect(() => {
// 		const el = mobileCardRefs.current[mobileIndex];
// 		if (el) {
// 			el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
// 		}
// 	}, [mobileIndex]);
  
//  	return (
// 		// NEW wrapper – lets us hide horizontal overflow on desktop only
// 		<div className="asset-type-wrapper">
// 			{/* Section header (desktop + mobile) */}
// 			<div className="mt-3 px-3 px-md-0 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
// 				<h5
// 					className="text-white fw-semibold mb-1 mb-md-0"
// 					style={{ fontSize: '1.05rem' }}
// 				>
// 					Browse by asset type
// 				</h5>
// 				<span
// 					className="text-white-50"
// 					style={{ fontSize: 12 }}
// 				>
// 					Videos, images, vectors, PSDs, AI graphics and more
// 				</span>
// 			</div>

// 			{/* Desktop / tablet: centered flex grid – 5 cards then 4 */}
// 			<div className="d-none d-md-flex px-3 px-md-0 mt-2 justify-content-center flex-wrap" style={{ gap: 24 }}>
// 				{CARDS.map((card) => (
// 					<div
// 						key={card.id}
// 						onClick={() => handleClick(card)}
// 						style={{
// 							cursor: 'pointer',
// 							width: 220,          // controls how many fit per row; ~5 on typical desktop
// 							maxWidth: '20rem',
// 							flexShrink: 0,
// 						}}
// 					>
// 						<div
// 							className="card border-0 h-100"
// 							style={{
// 								borderRadius: 18,
// 								overflow: 'hidden',
// 								minHeight: 150,
// 								//  backgroundColor: '#020617',
// 								// boxShadow: '0 18px 45px rgba(15,23,42,0.55)',
// 							}}
// 						>
// 							{renderCardInner(card)}
// 						</div>
// 					</div>
// 				))}
// 			</div>

// 			{/* Mobile: wide swipeable cards, auto-move, scrollbar hidden via CSS */}
// 			<div
// 				className="d-flex d-md-none mt-3 px-3 asset-type-carousel"
// 				style={{ overflowX: 'auto', gap: 16, scrollSnapType: 'x mandatory' }}
// 			>
// 				{CARDS.map((card, index) => (
// 					<div
// 						key={card.id}
// 						ref={(el) => (mobileCardRefs.current[index] = el)}
// 						style={{
// 							minWidth: '80%',
// 							maxWidth: 320,
// 							flexShrink: 0,
// 							scrollSnapAlign: 'center',
// 						}}
// 						onClick={() => handleClick(card)}
// 					>
// 						<div
// 							className="card border-0 shadow-sm"
// 							style={{
// 								borderRadius: 18,
// 								overflow: 'hidden',
// 								height: 180,
// 								cursor: 'pointer',
// 								boxShadow: '0 14px 38px rgba(15,23,42,0.5)',
// 								backgroundColor: '#020617',
// 							}}
// 						>
// 							{renderCardInner(card)}
// 						</div>
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// }

// export default AppNavbarBanner1Compo;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import videosImg from '../../assets/01_Videos_4K.jpg';
import imagesImg from '../../assets/02_Images_4K.jpg';
import vectorImg from '../../assets/03_Vector_4K.jpg';
import psdImg from '../../assets/04_PSD_4K.jpg';
import aiImagesImg from '../../assets/05_AI_Images_4K.jpg';
import templatesImg from '../../assets/06_Templates_4K.jpg';
import iconsImg from '../../assets/07_Icons_4K.jpg';
import mockupsImg from '../../assets/08_Mockups_4K.jpg';
import nftsImg from '../../assets/09_NFTs_4K.jpg';

const CARDS = [
    {
        id: 'videos',
        label: 'Videos',
        kind: 'image',
        src: videosImg,
        target: 'video',
    },
    {
        id: 'images',
        label: 'Images',
        kind: 'image',
        src: imagesImg,
        target: 'image',
    },
    {
        id: 'vector',
        label: 'Vector',
        kind: 'image',
        src: vectorImg,
        target: 'vector',
    },
    {
        id: 'psd',
        label: 'PSD',
        kind: 'image',
        src: psdImg,
        target: 'psd',
    },
    {
        id: 'ai-images',
        label: 'AI images',
        kind: 'image',
        src: aiImagesImg,
        target: 'Ai images',
    },
    {
        id: 'templates',
        label: 'Templates',
        kind: 'image',
        src: templatesImg,
        target: 'templates',
    },
    {
        id: 'icons',
        label: 'Icons',
        kind: 'image',
        src: iconsImg,
        target: 'icon',
    },
    {
        id: 'mockups',
        label: 'Mockups',
        kind: 'image',
        src: mockupsImg,
        target: 'mockups',
    },
    {
        id: 'nfts',
        label: 'NFTS',
        kind: 'image',
        src: nftsImg,
        target: 'nfts',
    },
];

function AppNavbarBanner1Compo() {
    const navigate = useNavigate();
    const [mobileIndex, setMobileIndex] = useState(0);
    const mobileCardRefs = useRef([]);

    const firstRowCards = CARDS.slice(0, 5);
    const secondRowCards = CARDS.slice(5);

    const handleClick = (card) => {
        if (!card?.target) return;
        navigate(`/collection/${card.target}`);
        window.scroll(0, 0);
    };

    const renderCardInner = (card) => {
        const overlay = (
            <>
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    // style={{
                    // 	background: 'linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7))',
                    // }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <h5
                        className="text-white mb-0"
                        style={{ fontSize: '0.95rem', fontWeight: 600 }}
                    >
                        {card.label}
                    </h5>
                </div>
            </>
        );

        return (
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
                {overlay}
            </div>
        );
    };

    // Auto-advance on mobile
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.innerWidth >= 768) return; // only mobile

        const interval = setInterval(() => {
            setMobileIndex((prev) => (prev + 1) % CARDS.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Scroll active card into view
    useEffect(() => {
        const el = mobileCardRefs.current[mobileIndex];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [mobileIndex]);

    return (
        <div className="asset-type-wrapper">
            {/* Section header (desktop + mobile) */}
            <div className="mt-3 px-3 px-md-0 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                <h5
                    className="text-white fw-semibold mb-1 mb-md-0"
                    style={{ fontSize: '1.05rem' }}
                >
                    Browse by asset type
                </h5>
                <span
                    className="text-white-50"
                    style={{ fontSize: 12 }}
                >
                    Videos, images, vectors, PSDs, AI graphics and more
                </span>
            </div>

            {/* Desktop / tablet: 2 rows (5 + remaining) */}
            <div className="d-none d-md-block px-3 px-md-0 mt-2">
                {/* First row: 5 cards */}
                <div className="d-flex justify-content-center" style={{ gap: 24 }}>
                    {firstRowCards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleClick(card)}
                            style={{
                                cursor: 'pointer',
                                width: 220,
                                maxWidth: '20rem',
                                flexShrink: 0,
                            }}
                        >
                            <div
                                className="card border-0 h-100"
                                style={{
                                    borderRadius: 18,
                                    overflow: 'hidden',
                                    minHeight: 150,
                                }}
                            >
                                {renderCardInner(card)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Second row: remaining cards */}
                <div className="d-flex justify-content-center mt-3" style={{ gap: 24 }}>
                    {secondRowCards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleClick(card)}
                            style={{
                                cursor: 'pointer',
                                width: 220,
                                maxWidth: '20rem',
                                flexShrink: 0,
                            }}
                        >
                            <div
                                className="card border-0 h-100"
                                style={{
                                    borderRadius: 18,
                                    overflow: 'hidden',
                                    minHeight: 150,
                                }}
                            >
                                {renderCardInner(card)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile: wide swipeable cards, auto-move, scrollbar hidden via CSS */}
            <div
                className="d-flex d-md-none mt-3 px-3 asset-type-carousel"
                style={{ overflowX: 'auto', gap: 16, scrollSnapType: 'x mandatory' }}
            >
                {CARDS.map((card, index) => (
                    <div
                        key={card.id}
                        ref={(el) => (mobileCardRefs.current[index] = el)}
                        style={{
                            minWidth: '80%',
                            maxWidth: 320,
                            flexShrink: 0,
                            scrollSnapAlign: 'center',
                        }}
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
