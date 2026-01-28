import React from 'react'
import './HomeBanner4.css'
function HomeBanner4() {
    return (
        <>
            <section >
                <div className="container rounded-3 my-4 " style={{ backgroundColor: "#2c012c" }}>
                    <div className="row d-flex justify-content-center align-items-center">
                        <div className="col-md-6">
                            <div className="py-5 px-3">
                                <h4 className='text-white display-4 fw-bold'>Upload Your Best Shots: Share Your Vision</h4>
                                <p className='text-white'>Upload your high-quality images and showcase your creativity. Whether it’s a stunning landscape or a special moment, your photos deserve to be seen. Just drag and drop your files or click to select, and we’ll take care of the rest.</p>
                                <div className="">
                                    <button className="button px-5 py-3">
                                        Get Started
                                        <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 px-0">
                            <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807489/file_plxiwd.webp"} className='img-fluid rounded-end-3 w-100' style={{ height: "550px", objectFit: "cover" }} alt="" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default HomeBanner4