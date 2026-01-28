import React from 'react'
import { useNavigate } from 'react-router-dom';

function AppNavbarBanner1Compo() {
    const navigate = useNavigate()
    const handle = (name) => {
        navigate(`/collection/${name}`);
        window.scroll(0, 0)
    }
    return (
        <>
            <div className="d-none d-lg-block">
                <div className="d-flex" style={{ gap: "0px 20px", overflow: "auto" }}>
                    <div className="col-auto mb-4">
                        <div className="card h-100 position-relative overflow-hidden border-none" style={{ display: 'inline-block', width: '200px', border: "none" }}>
                            <div className="card h-100 position-relative overflow-hidden border-none" style={{ border: "none", cursor: "pointer" }} onClick={() => { handle('video') }}>
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    className="w-100 h-100"
                                    style={{ objectFit: "cover", border: "none" }}
                                    src={"https://res.cloudinary.com/ds819uy6o/video/upload/v1730803635/file_puhduq.mp4"}
                                >
                                    Your browser does not support the video tag.
                                </video>
                                <div
                                    className="bg-dark position-absolute top-0 start-0 w-100 h-100"
                                    style={{ opacity: "0.6" }}
                                />
                                <div className="card-body d-flex align-items-center justify-content-center text-white position-absolute w-100 h-100">
                                    <h5 className="card-title" style={{ fontSize: "1.1rem" }}>
                                        Videos 
                                    </h5>{" "}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-auto mb-4">
                        <div
                            className="card h-100 position-relative overflow-hidden"
                            style={{
                                backgroundImage: `url(${"https://res.cloudinary.com/dhssktx47/image/upload/v1732776227/1732776220302-306176920_hk6qcb.webp"})`,
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                display: 'inline-block',
                                width: '200px',
                                border: "none",
                                cursor: "pointer"
                            }}
                            onClick={() => { handle('image') }}
                        >
                            <div className="bg-dark position-absolute top-0 start-0 w-100 h-100" style={{ opacity: "0.6" }} />
                            <div className="card-body d-flex align-items-center justify-content-center text-white position-absolute w-100 h-100">
                                <h5 className="card-title" style={{ fontSize: "1.1rem" }}>Images</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-auto mb-4">
                        <div
                            className="card h-100 position-relative overflow-hidden"
                            style={{
                                backgroundImage: `url(${"https://res.cloudinary.com/dhssktx47/image/upload/v1732776227/1732776220303-777562304_nxbq8m.webp"})`,
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                display: 'inline-block',
                                width: '200px',
                                border: "none",
                                cursor: "pointer"
                            }}
                            onClick={() => { handle('vector') }}
                        >
                            <div className="bg-dark position-absolute top-0 start-0 w-100 h-100" style={{ opacity: "0.6" }} />
                            <div className="card-body d-flex align-items-center justify-content-center text-white position-absolute w-100 h-100">
                                <h5 className="card-title" style={{ fontSize: "1.1rem" }}>Vector</h5>
                            </div>
                        </div>
                    </div>
                    <div className="col-auto mb-4">
                        <div
                            className="card h-100 position-relative overflow-hidden"
                            style={{
                                backgroundImage: `url(${"https://res.cloudinary.com/dhssktx47/image/upload/v1732776228/1732776220305-240594591_wyypu4.webp"})`,
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                display: 'inline-block',
                                width: '200px',
                                border: "none",
                                cursor: "pointer"
                            }}
                            onClick={() => { handle('psd') }}
                        >
                            <div className="bg-dark position-absolute top-0 start-0 w-100 h-100" style={{ opacity: "0.6" }} />
                            <div className="card-body d-flex align-items-center justify-content-center text-white position-absolute w-100 h-100">
                                <h5 className="card-title" style={{ fontSize: "1.1rem" }}>PSD</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AppNavbarBanner1Compo