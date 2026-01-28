import React from 'react';

function BlogsPageBanner1() {
    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card position-relative overflow-hidden">
                            <img
                                src={"https://imagesvideoszipfilesbuckets.s3.ap-south-1.amazonaws.com/WhatsApp+Image+2024-11-08+at+4.26.43+PM+(1).jpeg"}
                                alt="Blog Banner"
                                className="card-img"
                                style={{ height: "400px", objectFit: "cover" }}
                            />
                            <div
                                className="card-img-overlay d-flex justify-content-center align-items-center flex-column text-white p-5"
                                style={{
                                    background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                <h1 className="display-3 fw-bold text-center mb-3">Natural & Beauty Photography: Unlocking the Power of Visual <br /> Storytelling for Digital Engagement</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BlogsPageBanner1