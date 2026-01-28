import React, { useEffect, useState } from 'react';
import './MoreRelatedImages.css';
import axios from 'axios';
function MoreRelatedVideos({ category }) {
    const [relatedImages, setRelatedImages] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const response = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
                const allImages = response.data.data;
                const filteredData = category
                    ? allImages.filter((item) => item.category === category)
                    : allImages;

                setRelatedImages(filteredData);
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        })();
    }, [category]);

    return (
        <>
            <div className="more-related-images-row mt-4 px-3 pb-5">
                <h3 className="more-related-images-title mb-3">Discover More Favorites</h3>
                <div className="more-related-images-container col-12 d-flex">
                    {relatedImages.slice(0, 40).map((data, index) => (
                        <div className="more-related-images-card-wrapper col-auto" key={index}>
                            <div className="more-related-images-card rounded-4">
                                <video src={data.imageUrl} loop muted autoPlay className="more-related-images-img rounded-4 img-fluid"></video>
                                <div className="more-related-images-overlay rounded-4 d-flex flex-column justify-content-end">
                                    <h5 className="more-related-images-category mb-2">{data.category || "Nature"}</h5>
                                    <div className="d-flex justify-content-between">
                                        <a
                                            href="#"
                                            className="more-related-images-download-btn rounded-circle"
                                        >
                                            <i className="fas fa-download" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="more-related-images-row mt-4 px-3 pb-5">
                <h3 className="more-related-images-title mb-3">You’ll Love These Too</h3>
                <div className="more-related-images-container col-12 d-flex">
                    {relatedImages.slice(50, 90).map((data, index) => (
                        <div className="more-related-images-card-wrapper col-auto" key={index}>
                            <div className="more-related-images-card rounded-4">
                                <video src={data.imageUrl} loop muted autoPlay className="more-related-images-img rounded-4 img-fluid"></video>
                                {/* <img src={data.imageUrl} className="more-related-images-img rounded-4 img-fluid" alt="..." /> */}
                                <div className="more-related-images-overlay rounded-4 d-flex flex-column justify-content-end">
                                    <h5 className="more-related-images-category mb-2">{data.category || "Nature"}</h5>
                                    <div className="d-flex justify-content-between">
                                        <a
                                            href="#"
                                            className="more-related-images-download-btn rounded-circle"
                                        >
                                            <i className="fas fa-download" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </>
    );
}

export default MoreRelatedVideos