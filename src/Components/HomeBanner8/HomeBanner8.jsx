import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useNavigate } from 'react-router-dom';
import videosImg from '../../assets/01_Videos_4K.png';
import imagesImg from '../../assets/02_Images_4K.png';
import vectorImg from '../../assets/03_Vector_4K.png';
import psdImg from '../../assets/04_PSD_4K.png';
import aiImagesImg from '../../assets/05_AI_Images_4K.png';
import templatesImg from '../../assets/06_Templates_4K.png';
import iconsImg from '../../assets/07_Icons_4K.png';
import mockupsImg from '../../assets/08_Mockups_4K.png';
import nftsImg from '../../assets/09_NFTs_4K.png';
import superHerosImg from '../../assets/Super-Heros.jpeg';

const homeBannerItems = [
    { name: 'Ai images', image: aiImagesImg },
    { name: 'templates', image: templatesImg },
    { name: 'icon', image: iconsImg },
    { name: 'mockups', image: mockupsImg },
    { name: 'video', image: videosImg },
    { name: 'vector', image: vectorImg },
    { name: 'image', image: imagesImg },
    { name: 'psd', image: psdImg },
    { name: 'NFTS', image: nftsImg },
    { name: 'Super Heroes', image: superHerosImg },
];

function HomeBanner8() {
    const navigate = useNavigate();

    const nextPage = async (name) => {
        navigate(`/collection/${name}`);
    }

    return (
        <div className="container py-3 d-lg-none">
            <div className="row">
                <div className="col-12">
                    <Swiper
                        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                        slidesPerView={3}
                        autoplay={{ delay: 2000, disableOnInteraction: false }}
                        loop={true}
                        spaceBetween={10}
                        style={{ height: "134px" }}
                        breakpoints={{
                            300: { slidesPerView: 1 },
                            481: { slidesPerView: 2 },
                            781: { slidesPerView: 3 },
                            1026: { slidesPerView: 4 },
                            1201: { slidesPerView: 3 },
                        }}
                    >
                        {homeBannerItems.map((item, index) => (
                            <SwiperSlide key={index}>
                                <div className="card text-white" style={{ position: "relative" }} onClick={() => nextPage(item.name)}>
                                    <img
                                        style={{ height: "130px", width: "100%", objectFit: "cover" }}
                                        src={item.image}
                                        className="card-img rounded-3"
                                        alt={item.name}
                                        loading="lazy"
                                    />
                                    <div
                                        className="card-img-overlay rounded-3"
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <h5 style={{ fontSize: "19px" }} className=" text-white fw-bold">{item.name}</h5>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
}

export default HomeBanner8;


