
import React, { Suspense, useTransition, useEffect, useState } from 'react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useNavigate } from 'react-router-dom';
import { fetchPublicBlogs } from '../../Services/blog';

function HomeBanner7() {
    const navigate = useNavigate();
    const [isPending, startTransition] = useTransition();
    const [trendingBlogs, setTrendingBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicBlogs()
            .then(data => {
                setTrendingBlogs((data || []).slice(0, 10));
            })
            .finally(() => setLoading(false));
    }, []);

    const handleBlogClick = (slug) => {
        startTransition(() => {
            navigate(`/blogs/${slug}`);
        });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12">
                    <h2 style={{ fontWeight: 700, textAlign: 'center', margin: '32px 0 24px 0' }}>Our Trending Blogs</h2>
                    <Suspense fallback={<div>Loading...</div>}>
                        {loading ? (
                            <div>Loading trending blogs...</div>
                        ) : (
                            <Swiper
                                modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                                spaceBetween={10}
                                autoplay={{ delay: 3000, disableOnInteraction: false }}
                                loop={true}
                                breakpoints={{
                                    300: { slidesPerView: 1 },
                                    481: { slidesPerView: 2 },
                                    781: { slidesPerView: 3 },
                                    1026: { slidesPerView: 4 },
                                    1201: { slidesPerView: 3 },
                                }}
                            >
                                {trendingBlogs.map((blog, index) => (
                                    <SwiperSlide key={blog._id || index}>
                                        <div
                                            className="card position-relative"
                                            onClick={() => handleBlogClick(blog.slug)}
                                            style={{ cursor: "pointer", height: 240 }}
                                        >
                                            <img
                                                src={blog.featureImage || (blog.media && blog.media[0]?.url) || '/default-blog.jpg'}
                                                className="card-img"
                                                style={{ height: 200, objectFit: 'cover', borderRadius: 8 }}
                                                alt={blog.title}
                                            />
                                            <div
                                                className="card-img-overlay d-flex align-items-center justify-content-center"
                                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                                            >
                                                <h5 className="card-title text-white" style={{ fontWeight: "bold", textAlign: 'center' }}>
                                                    {blog.title}
                                                </h5>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </Suspense>
                    {isPending && <div>Loading page content...</div>}
                </div>
            </div>
        </div>
    );
}

export default HomeBanner7;
