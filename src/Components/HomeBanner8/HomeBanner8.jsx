import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useNavigate } from 'react-router-dom';

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
                        {[
                            { name: 'Ai images', image: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730803633/file_ku7osu.png" },
                            { name: 'templates', image: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730821567/file_slokgc.png" },
                            { name: 'icon', image: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730803633/file_sqaf23.png" },
                            { name: 'mockups', image: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730801102/file_fthnge.png" },
                            { name: 'video', image: "https://res.cloudinary.com/ds819uy6o/video/upload/v1730803635/file_puhduq.mp4", isVideo: true },
                            { name: 'vector', image: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730803633/file_wzjssh.png" },
                            { name: 'image', image: 'https://res.cloudinary.com/ds819uy6o/image/upload/v1730803633/file_shfd3c.png' },
                            { name: 'psd', image: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730803633/file_usoap6.png" },
                            { name: 'NFTS', image: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730802124/file_onvr1k.jpg" },
                        ].map((item, index) => (
                            <SwiperSlide key={index}>
                                <div className="card text-white" style={{ position: "relative" }} onClick={() => nextPage(item.name)}>
                                    {item.isVideo ? (
                                        <video
                                            rel="preload"
                                            src={item.image}
                                            style={{ height: "130px", width: "100%", objectFit: "cover" }}
                                            loop muted autoPlay
                                        />
                                    ) : (
                                        <img
                                            rel="preload"
                                            style={{ height: "130px", width: "100%", objectFit: "cover" }}
                                            src={item.image}
                                            className="card-img rounded-3"
                                            alt={item.name}
                                        />
                                    )}
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
