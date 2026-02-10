import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeBanner1.css';
import api from '../../Services/api.js';
import { API_ENDPOINTS } from '../../config/api.config.js';

// here in this component we have to display cards by sub categories 
function HomeBanner1() {   // home banner1 component
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);

    const handle = (name) => {
        navigate(`/collection/${encodeURIComponent(name)}`);
        window.scroll(0, 0);
    };

    // NEW: load top‑trending sub‑category collections for parent "Image"
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const res = await api.get(API_ENDPOINTS.SUBCATEGORY_COLLECTIONS, {
                    params: {
                        parent: 'Image',
                        isTrending: true,
                        active: true,
                    },
                });
                setCollections(res.data?.data || []);
            } catch (e) {
                console.error('[HomeBanner1] failed to load collections', e);
                setCollections([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    const getCoverUrl = (col) => {
        if (col.coverImageUrl) return col.coverImageUrl;
        if (col.coverAsset?.imageUrl) return col.coverAsset.imageUrl;
        if (Array.isArray(col.assetIds) && col.assetIds[0]?.imageUrl) {
            return col.assetIds[0].imageUrl;
        }
        return 'https://via.placeholder.com/600x400?text=Collection'; // fallback
    };

    const handleCollectionClick = (col) => {
        const rawSubName = col.subcategory?.name || '';
        if (!rawSubName) return;
        // Capitalize nicely for URL, FilterationImages normalizes internally
        const label = rawSubName.charAt(0).toUpperCase() + rawSubName.slice(1);
        // Use collection slug in query so /collection/:name can load curated assets
        const slug = col.slug;
        let url = `/collection/${encodeURIComponent(label)}`;
        if (slug) {
            url += `?collection=${encodeURIComponent(slug)}`;
        }
        navigate(url);
        window.scroll(0, 0);
    };

    return (
        <>
            <div className="container py-4 mt-4">
                {/* Heading + subheading with better spacing */}
                <div className="mb-3 text-center text-md-start">
                    <h3 className='fw-bold display-5 mb-1'>Explore Our Collections</h3>
                    <p className='fw-semibold text-muted mb-0'>
                        Find the perfect visuals for every project.
                    </p>
                </div>

                {/* NEW: dynamic top‑trending collections by subcategory */}
                <div className="row g-3 mb-3">
                    {loading && (
                        <p className="text-muted mb-0">Loading collections…</p>
                    )}
                    {!loading && collections.length === 0 && (
                        <p className="text-muted mb-0">
                            No curated collections yet. Using default layout below.
                        </p>
                    )}
                    {!loading && collections.map((col) => (
                        <div
                            key={col._id}
                            className="col-6 col-md-3 d-flex"
                            onClick={() => handleCollectionClick(col)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card position-relative w-100">
                                <img
                                    src={getCoverUrl(col)}
                                    className="card-img w-100"
                                    style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                                    alt={col.name}
                                />
                                <div
                                    className="card-img-overlay overlay-cards-css d-flex flex-column justify-content-center"
                                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                                >
                                    <h5 className="card-title text-white fw-bold mb-1">
                                        {col.name}
                                    </h5>
                                    <p className="text-white-50 mb-0" style={{ fontSize: '0.8rem' }}>
                                        {col.subcategory?.name || 'Subcategory'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Existing static collage layout by subcategories (kept as fallback / secondary section) */}
                {/* <div className="row home-banner-coutmoe-css g-3">
                    <div className="col-6 col-md-3 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("Characters") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776800/1732776800260-501451669_slax68.webp"} className="card-img w-100" style={{ height: "200px", width: "100%" }} alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Characters
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-9 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("Wallpaper") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776801/1732776800263-553650998_q42e7j.webp"} style={{ height: "200px" }} className="card-img w-100" alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Wallpaper
                                </h5>
                            </div>  
                        </div>
                    </div>
                    <div className="col-6 col-md-4">
                        <div className="card position-relative" onClick={() => { handle("Business and technology") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776802/1732776800264-342480105_qmkbqe.webp"} className="card-img w-100" style={{ width: "100%", height: "200px" }} alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Business & Work
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-8 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("City & Architecture") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776803/1732776800267-533166328_z2evcl.webp"} className="card-img w-100" style={{ height: "200px", width: "100%" }} alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    City & Architecture
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-7 d-flex" onClick={() => { handle("Education & Learning") }} style={{ cursor: "pointer" }}>
                        <div className="card position-relative w-100">
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776804/1732776800268-809854754_icgin9.webp"} style={{ height: "260px" }} className="card-img w-100" alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Education & Learning
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-5 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("Technology & Innovation") }} style={{ cursor: "pointer" }}>
                            <video src={"https://res.cloudinary.com/ds819uy6o/video/upload/v1730804364/file_yjdig6.mp4"} autoPlay muted loop className='img-fluid w-100' style={{ width: "100%", height: "200px" }}></video>
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Technology & Innovation
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("Nature & Landscapes") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732777304/1732777303455-932513793_nj1hsv.webp"} style={{ height: "200px" }} className="card-img w-100" alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Nature & Landscapes
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-5 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("Sports & Action") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732777305/1732777303456-149199847_q8u0xm.webp"} className="card-img w-100" style={{ height: "200px", width: "100%" }} alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Sports & Action
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 d-flex">
                        <div className="card position-relative" onClick={() => { handle("Travel & Adventure") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732777307/1732777303458-907531873_t2dolp.webp"} style={{ height: "200px" }} className="card-img w-100" alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Travel & Adventure
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3 d-flex">
                        <div className="card position-relative" onClick={() => { handle("coffe cup") }} style={{ cursor: "pointer" }}>
                            <video src={"https://res.cloudinary.com/ds819uy6o/video/upload/v1730801102/file_kcfypc.mp4"} autoPlay muted loop className='img-fluid w-100'></video>
                            <div
                                className="card-img-overlay overlay-coffe-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    coffe cup
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-5 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("Swedding invitation") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732777308/1732777303460-885525724_pchqrd.webp"} className="card-img w-100" style={{ height: "200px", width: "100%" }} alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    Wedding invitation
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-4 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("instagram mockup") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732777309/1732777303460-794274540_yqc74l.webp"} style={{ height: "200px" }} className="card-img w-100" alt="..." />
                            <div
                                className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                    instagram mockup
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 d-flex">
                        <div className="card position-relative w-100" onClick={() => { handle("celebraty") }} style={{ cursor: "pointer" }}>
                            <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732777310/1732777303461-239050160_lc2zb4.webp"} style={{ height: "200px", width: '100%', objectFit: "cover" }} className="card-img w-100" alt="..." />
                            <div
                                className="card-img-overlay overlay-coffe-cards-css  d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                                <h5 className="card-title text-white fs-2" style={{ fontWeight: "bold" }}>
                                    Celebrities
                                </h5>
                            </div>
                        </div>
                    </div>
                    
                </div> */}
            </div>
        </>
    );
}

export default HomeBanner1;
