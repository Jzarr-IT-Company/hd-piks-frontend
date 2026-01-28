import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Skeleton } from 'antd';
import './LazyLoadImage.css';

const LazyLoadImage2 = ({ src, alt, className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = React.useRef();

    // Use useMemo to prevent re-render of skeleton when the image is already loaded
    const skeletonStyle = useMemo(() => ({
        width: '100%',
        height: '200px',
        borderRadius: 8,
        animation: 'skeleton-load 1s linear infinite',
    }), []);

    // Intersection Observer for Lazy Loading
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                    observer.disconnect();  // Stop observing once the image is visible
                }
            });
        });

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [isVisible]);

    // Handle image loading
    const handleImageLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div
            style={{
                position: 'relative',
                height: 'auto',
                transition: 'opacity 0.3s ease-in-out',
            }}
            className={className}
        >
            {!isLoaded && isVisible && (
                <Skeleton.Image
                    className="w-100"
                    style={skeletonStyle}
                    active
                />
            )}

            <img
                ref={imgRef}
                src={isVisible ? src : ''}
                alt={alt}
                className="lazy-image"
                style={{
                    width: '100%',
                    borderRadius: '8px',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                }}
                loading="lazy"
                onLoad={handleImageLoad}
            />
        </div>
    );
};

// PropTypes validation for the component
LazyLoadImage2.propTypes = {
    src: PropTypes.string.isRequired,  // `src` should be a string and is required
    alt: PropTypes.string.isRequired,  // `alt` should be a string and is required
    className: PropTypes.string        // `className` should be a string, optional
};

export default LazyLoadImage2;
