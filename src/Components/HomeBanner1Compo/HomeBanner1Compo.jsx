import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import imagesImg from '../../assets/02_Images_4K.jpeg';
import vectorImg from '../../assets/03_Vector_4K.jpeg';
import psdImg from '../../assets/04_PSD_4K.jpeg';
import aiImagesImg from '../../assets/05_AI_Images_4K.jpeg';
import templatesImg from '../../assets/06_Templates_4K.jpeg';
import iconsImg from '../../assets/07_Icons_4K.jpeg';
import mockupsImg from '../../assets/08_Mockups_4K.jpeg';
import nftsImg from '../../assets/09_NFTs_4K.jpeg';
import superHerosImg from '../../assets/Super-Heros.jpeg';

const bannerItems = [
    { title: 'Characters', imgSrc: imagesImg },
    { title: 'Wallpaper', imgSrc: imagesImg },
    { title: 'NFTS', imgSrc: nftsImg },
    { title: 'Business & Work', imgSrc: imagesImg },
    { title: 'City & Architecture', imgSrc: imagesImg },
    { title: 'Education & Learning', imgSrc: imagesImg },
    { title: 'Technology & Innovation', imgSrc: aiImagesImg },
    { title: 'Nature & Landscapes', imgSrc: imagesImg },
    { title: 'Sports & Action', imgSrc: imagesImg },
    { title: 'Travel & Adventure', imgSrc: imagesImg },
    { title: 'Coffee Cup', imgSrc: mockupsImg },
    { title: 'Wedding Invitation', imgSrc: templatesImg },
    { title: 'Instagram Mockup', imgSrc: mockupsImg },
    { title: 'Vector', imgSrc: vectorImg },
    { title: 'PSD', imgSrc: psdImg },
    { title: 'Icons', imgSrc: iconsImg },
    { title: 'Super Heroes', imgSrc: superHerosImg },
];

const BannerCard = ({ title, imgSrc, onClick }) => {
    return (
        <div className="col-md-3 d-flex">
            <div
                className="card position-relative w-100"
                onClick={onClick}
                style={{ cursor: 'pointer' }}
            >
                <img
                    src={imgSrc}
                    className="card-img w-100"
                    style={{ height: '200px' }}
                    alt={title}
                    loading="lazy"
                />
                <div
                    className="card-img-overlay overlay-cards-css d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <h5 className="card-title text-white" style={{ fontWeight: 'bold' }}>
                        {title}
                    </h5>
                </div>
            </div>
        </div>
    );
};

BannerCard.propTypes = {
    title: PropTypes.string.isRequired,
    imgSrc: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

function HomeBanner1Compo() {
    const navigate = useNavigate();

    const handleNavigate = (name) => {
        navigate(`/collection/${name}`);
        window.scrollTo(0, 0);
    };

    return (
        <div className="container d-block d-md-none mb-20">
            <h3 className="fw-bold display-5">Explore Our</h3>
            <p className="fw-semibold">Find the perfect visuals for every project.</p>
            <div className="row home-banner-coutmoe-css" style={{ display: 'flex' }}>
                {bannerItems.map((item, index) => (
                    <BannerCard
                        key={index}
                        title={item.title}
                        imgSrc={item.imgSrc}
                        onClick={() => handleNavigate(item.title)}
                    />
                ))}
            </div>
        </div>
    );
}

export default HomeBanner1Compo;


