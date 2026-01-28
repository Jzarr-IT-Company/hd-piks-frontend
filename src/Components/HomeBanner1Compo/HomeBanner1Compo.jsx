import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const BannerCard = ({ title, imgSrc, isVideo, videoSrc, onClick }) => {
    return (
        <div className="col-md-3 d-flex">
            <div
                className="card position-relative w-100"
                onClick={onClick}
                style={{ cursor: 'pointer' }}
            >
                {isVideo ? (
                    <video
                        rel="preload"
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        className="img-fluid w-100"
                        style={{ height: '200px' }}
                    ></video>
                ) : (
                    <img
                        rel="preload"
                        src={imgSrc}
                        className="card-img w-100"
                        style={{ height: '200px' }}
                        alt={title}
                    />
                )}
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
    isVideo: PropTypes.bool.isRequired,     
    videoSrc: PropTypes.string,             
    onClick: PropTypes.func.isRequired,    
};

function HomeBanner1Compo() {
    const navigate = useNavigate();

    const handleNavigate = (name) => {
        navigate(`/collection/${name}`);
        window.scrollTo(0, 0);
    };

    const bannerItems = [
        { title: 'Characters', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796494/1732796493206-231658353_zq0dru.webp', isVideo: false },
        { title: 'Wallpaper', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796495/1732796493209-771456613_wlfcpa.webp', isVideo: false },
        { title: 'NFTS', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796496/1732796493220-101536859_rwabso.webp', isVideo: false },
        { title: 'Business & Work', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796497/1732796493221-398780433_jdyzd9.webp', isVideo: false },
        { title: 'City & Architecture', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796498/1732796493223-706551766_l7voym.webp', isVideo: false },
        { title: 'Education & Learning', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796499/1732796493230-601017987_duwae2.webp', isVideo: false },
        { title: 'Technology & Innovation', videoSrc: 'https://res.cloudinary.com/ds819uy6o/video/upload/v1730804364/file_yjdig6.mp4', isVideo: true },
        { title: 'Nature & Landscapes', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796500/1732796493232-8867644_ol97te.webp', isVideo: false },
        { title: 'Sports & Action', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796501/1732796493234-545650371_kvsjic.webp', isVideo: false },
        { title: 'Travel & Adventure', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796502/1732796493241-489226813_zmxq5r.webp', isVideo: false },
        { title: 'Coffee Cup', videoSrc: 'https://res.cloudinary.com/ds819uy6o/video/upload/v1730801102/file_kcfypc.mp4', isVideo: true },
        { title: 'Wedding Invitation', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796503/1732796493243-28667801_ggksn6.webp', isVideo: false },
        { title: 'Instagram Mockup', imgSrc: 'https://res.cloudinary.com/dhssktx47/image/upload/v1732796504/1732796493245-420154818_k4egtx.webp', isVideo: false },
    ];

    return (
        <div className="container d-block d-md-none">
            <h3 className="fw-bold display-5">Explore Our</h3>
            <p className="fw-semibold">Find the perfect visuals for every project.</p>
            <div className="row home-banner-coutmoe-css" style={{ display: 'flex' }}>
                {bannerItems.map((item, index) => (
                    <BannerCard
                        key={index}
                        title={item.title}
                        imgSrc={item.imgSrc}
                        videoSrc={item.videoSrc}
                        isVideo={item.isVideo}
                        onClick={() => handleNavigate(item.title)}
                    />
                ))}
            </div>
        </div>
    );
}

export default HomeBanner1Compo;
