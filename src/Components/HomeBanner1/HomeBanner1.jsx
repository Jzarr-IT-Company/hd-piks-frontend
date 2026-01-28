import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeBanner1.css'

function HomeBanner1() {
    const navigate = useNavigate()
    const handle = (name) => {
        navigate(`/collection/${name}`)
        window.scroll(0, 0)
    }
    return (
        <>
        <div className="container d-none d-md-block">
            <h3 className='fw-bold display-5'>Explore Our</h3>
            <p className='fw-semibold'>Find the perfect visuals for every project.</p>
            <div className="row home-banner-coutmoe-css " style={{ display: "flex" }}>
                <div className="col-md-3 d-flex">
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
                <div className="col-md-7 d-flex">
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
                <div className="col-md-2 d-flex">
                    <div className="card position-relative w-100" onClick={() => { handle("characters") }} style={{ cursor: "pointer" }}>
                        <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776222/1732776220275-345356068_pxrjan.webp"} className="card-img w-100" style={{ height: "200px", width: "100%" }} alt="..." />
                        <div
                            className="card-img-overlay overlay-cards-css  d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                        >
                            <h5 className="card-title text-white" style={{ fontWeight: "bold" }}>
                                NFTS
                            </h5>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
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
                <div className="col-md-8 d-flex">
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
                <div className="col-md-7 d-flex" onClick={() => { handle("Education & Learning") }} style={{ cursor: "pointer" }}>
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
                <div className="col-md-5 d-flex">
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
                <div className="col-md-4 d-flex">
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
                <div className="col-md-5 d-flex">
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
                <div className="col-md-3 d-flex">
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
                <div className="col-md-3 d-flex">
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
                <div className="col-md-5 d-flex">
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
                <div className="col-md-4 d-flex">
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
                <div className="col-md-12 d-flex">
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
                <div className="col-md-6 d-flex">
                    <div className="card position-relative w-100" onClick={() => { handle("celebraty") }} style={{ cursor: "pointer" }}>
                        <img src={"https://imagesvideoszipfilesbuckets.s3.ap-south-1.amazonaws.com/Dps.jpeg"} style={{ height: "200px", width: '100%', objectFit: "cover" }} className="card-img w-100" alt="..." />
                        <div
                            className="card-img-overlay overlay-coffe-cards-css  d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                        >
                            <h5 className="card-title text-white fs-2" style={{ fontWeight: "bold" }}>
                                Dps
                            </h5>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 d-flex">
                    <div className="card position-relative w-100" onClick={() => { handle("celebraty") }} style={{ cursor: "pointer" }}>
                        <img src={"https://imagesvideoszipfilesbuckets.s3.ap-south-1.amazonaws.com/DALL%C2%B7E+2024-11-07+20.13.57+-+A+natural+and+artistic+image+of+numbers+and+alphabets+created+with+natural+elements+like+leaves%2C+stones%2C+and+wooden+twigs.+The+numbers+and+letters+are.webp"} style={{ height: "200px", width: '100%', objectFit: "cover" }} className="card-img w-100" alt="..." />
                        <div
                            className="card-img-overlay overlay-coffe-cards-css  d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                        >
                            <h5 className="card-title text-white fs-2" style={{ fontWeight: "bold" }}>
                                Alphabets & Numberic
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default HomeBanner1;
