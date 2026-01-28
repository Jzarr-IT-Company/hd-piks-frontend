import React from 'react';
import './BlogsBanner2.css';
import { useNavigate } from 'react-router-dom';

function BlogsBanner2() {
    const navigate = useNavigate();

    const handleBlogsPage = (slug) => {
        navigate(`/blog/${slug}`);
        window.scroll(0, 0);
    };

    return (
        <div className="container py-5">
            <div className="col-12 text-center mb-4">
                <h2 className="display-4 fw-bold">Latest Blogs</h2>
                <p className="lead text-muted">
                    Dive into our latest blogs to stay up-to-date with the current trends and insights in the world of technology, design, lifestyle, and more.
                </p>
            </div>
            <div className="row g-4">
                {[
                    {
                        slug: 'natural-beauty-photography',
                        imgSrc: 'https://imagesvideoszipfilesbuckets.s3.ap-south-1.amazonaws.com/blog1_image.webp',
                        title: 'Natural & Beauty Photography: Unlocking the Power of Visual Storytelling for Digital Engagement',
                        description: "Discover how free stock images can transform your website's design and user engagement."
                    },
                    {
                        slug: 'hdpiks-mockups-branding-resources',
                        imgSrc: 'https://imagesvideoszipfilesbuckets.s3.ap-south-1.amazonaws.com/WhatsApp+Image+2024-11-08+at+4.25.44+PM+(1).jpeg',
                        title: 'Hdpiks.com: Your Go-To Source for Choosing the Right Mockups and Branding Resources',
                        description: "Learn how incorporating free stock photos can boost your business' online presence.",
                        imgStyle: { height: '240px' }
                    },
                    {
                        slug: 'improve-website-user-experience',
                        imgSrc: 'https://imagesvideoszipfilesbuckets.s3.ap-south-1.amazonaws.com/blog2_image.webp',
                        title: "How Free Stock Images Can Improve Your Website's User Experience",
                        description: 'Find out how to enhance user experience by using the right stock images for your website.'
                    },
                    {
                        slug: 'free-stock-images-user-experience',
                        imgSrc: 'https://imagesvideoszipfilesbuckets.s3.ap-south-1.amazonaws.com/WhatsApp+Image+2024-11-08+at+4.26.43+PM+(1).jpeg',
                        title: "How Free Stock Images Can Improve Your Website's User Experience",
                        description: 'Find out how to enhance user experience by using the right stock images for your website.'
                    }
                ].map((blog, index) => (
                    <div key={index} className="col-md-4 col-sm-12">
                        <div
                            className="card border-0 shadow-lg rounded"
                            onClick={() => handleBlogsPage(blog.slug)}
                        >
                            <div className="image-container">
                                <img
                                    src={blog.imgSrc}
                                    className="card-img-top blog-image"
                                    alt={blog.title}
                                    style={blog.imgStyle || {}}
                                />
                            </div>
                            <div className="card-body text-center py-4">
                                <h5 className="card-title fw-bold mb-3">
                                    {blog.title}
                                </h5>
                                <p className="card-text text-muted">
                                    {blog.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BlogsBanner2;
