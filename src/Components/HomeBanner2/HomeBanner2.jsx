import React from 'react'
import HomeBanner8 from '../HomeBanner8/HomeBanner8'
import { useNavigate } from 'react-router-dom'
function HomeBanner2() {

    const navigate = useNavigate()
    const nextPage = async (name) => {
        navigate(`/collection/${name}`)
    }
    return (
        <>
            <div className="container my-4 d-none d-lg-block">
                <div className="row justify-content-center">
                    <div className="col-2 mb-4">
                        <div className="card" onClick={() => { nextPage('Ai images') }} style={{ position: "relative",cursor:"pointer" }}>
                            <img
                                style={{ height: "130px", width: "100%", objectFit: "cover" }}
                                src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776223/1732776220275-583344844_ymuzly.webp"}
                                className="card-img"
                                alt="..."
                            />
                            <div
                                className="card-img-overlay"
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
                                <h5 style={{ fontSize: "19px" }} className="card-title fw-bold">AI images</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-2 mb-4">
                        <div className="card" onClick={() => { nextPage('templates') }} style={{ position: "relative",cursor:"pointer" }}>
                            <img
                                style={{ height: "130px", width: "100%", objectFit: "cover" }}
                                src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776220/1732776220271-18486134_lavrtc.webp"}
                                className="card-img"
                                alt="..."
                            />
                            <div
                                className="card-img-overlay"
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
                                <h5 style={{ fontSize: "19px" }} className="card-title fw-bold">Templates</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-2 mb-4">
                        <div className="card" onClick={() => { nextPage('icon') }} style={{ position: "relative",cursor:"pointer" }}>
                            <img
                                style={{ height: "130px", width: "100%", objectFit: "cover" }}
                                src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776221/1732776220274-965804785_hznrmg.webp"}
                                className="card-img"
                                alt="..."
                            />
                            <div
                                className="card-img-overlay"
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
                                <h5 style={{ fontSize: "19px" }} className="card-title fw-bold">Icons</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-2 mb-4">
                        <div className="card" onClick={() => { nextPage('mockups') }} style={{ position: "relative",cursor:"pointer" }}>
                            <img
                                style={{ height: "130px", width: "100%", objectFit: "cover" }}
                                src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776224/1732776220275-691740809_vsrob9.webp"}
                                className="card-img"
                                alt="..."
                            />
                            <div
                                className="card-img-overlay"
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
                                <h5 style={{ fontSize: "19px" }} className="card-title fw-bold">Mockups</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-2 mb-4">
                        <div className="card" onClick={() => { nextPage('nfts') }} style={{ position: "relative",cursor:"pointer" }}>
                            <img
                                style={{ height: "130px", width: "100%", objectFit: "cover" }}
                                src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776222/1732776220275-345356068_pxrjan.webp"}
                                className="card-img"
                                alt="..."
                            />
                            <div
                                className="card-img-overlay"
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
                                <h5 style={{ fontSize: "19px" }} className="card-title fw-bold">NFTS</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <HomeBanner8 />
        </>
    )
}

export default HomeBanner2