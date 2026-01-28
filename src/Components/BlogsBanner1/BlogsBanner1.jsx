import React from 'react';
import img1 from '../../assets/blogs.jpg';

function BlogsBanner1() {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card position-relative overflow-hidden">
                        <img 
                            src={img1} 
                            alt="Blog Banner" 
                            className="card-img" 
                            style={{ height: "400px", objectFit: "cover" }} 
                        />
                        <div 
                            className="card-img-overlay d-flex justify-content-center align-items-center flex-column text-white p-5"
                            style={{
                                background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
                                backdropFilter: 'blur(5px)', // Adding a subtle blur for the overlay
                            }}
                        >
                            <h1 className="display-3 fw-bold text-center mb-3">HDPiks Blogs</h1>
                            <p className="lead text-center mb-4">
                                Explore the latest insights, trends, and articles to stay updated in various fields.
                            </p>
                            {/* <a href="#blog-section" className="btn btn-light btn-lg">Read Our Blogs</a> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogsBanner1;
