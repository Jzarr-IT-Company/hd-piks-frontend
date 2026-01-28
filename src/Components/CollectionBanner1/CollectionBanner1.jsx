import React from 'react';
import './CollectionBanner1.css';

const imageCollections = [
    {
        title: "Explore Our Collection",
        backgroundImage: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730805824/file_je2q1b.png", 
        images: [
            "https://res.cloudinary.com/ds819uy6o/image/upload/v1730805824/file_nkgccq.png",
            "https://res.cloudinary.com/ds819uy6o/image/upload/v1730805829/file_wvmk6e.png",
            "https://res.cloudinary.com/ds819uy6o/image/upload/v1730805829/file_wvmk6e.png",
        ]
    },
    {
        title: "Food & Culinary Art",
        backgroundImage: "https://res.cloudinary.com/ds819uy6o/image /upload/v1730805933/file_zofwhh.jpg", 
        images: [
            "https://res.cloudinary.com/ds819uy6o/image/upload/v1730805933/file_i2bycm.jpg",
            "https://res.cloudinary.com/ds819uy6o/image/upload/v1730805933/file_ftnujn.jpg",
            "https://res.cloudinary.com/ds819uy6o/image/upload/v1730805933/file_zofwhh.jpg",
        ]
    },
    {
        title: "Travel & Adventure",
        backgroundImage: "https://res.cloudinary.com/ds819uy6o/image/upload/v1730806020/file_edv9rf.jpg", 
        images: [
            "https://res.cloudinary.com/ds819uy6o/image/upload/v1730806020/file_wgn4ob.jpg",
            "https://res.cloudinary.com/ds819uy6o/image/upload/v1730806020/file_edv9rf.jpg",
        ]
    }
];

function CollectionBanner1() {
    return (
        <section>
            <div className="container pb-3 pt-3">
                <h2 className="fw-bold"><small> Collections</small></h2>
                <h2 className="display-4 fw-bold">Unleash Your Creativity</h2>
                <p className="description-text">
                    Discover a world of inspiration with our handpicked collections designed to ignite your creativity and elevate your projects.
                </p>
                <div className="row mt-4 py-3">
                    {imageCollections.map((collection, index) => (
                        <div className="col-md-4 col-12" key={index}>
                            <div className="collection-container">
                                <div className="collection-card">
                                    <div 
                                        className="collection-background" 
                                        style={{ backgroundImage: `url(${collection.backgroundImage})` }}
                                    />
                                    <div className="collection-gradient" /> {/* Gradient overlay */}
                                    <div className="collection-thumbnails">
                                        {collection.images.map((image, imgIndex) => (
                                            <img 
                                                key={imgIndex} 
                                                src={image} 
                                                loading="lazy" 
                                                className="thumbnail-image" 
                                                alt={collection.title} 
                                            />
                                        ))}
                                    </div>
                                    <div className="collection-card-body">
                                        <p className="collection-card-text">{collection.title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default React.memo(CollectionBanner1);