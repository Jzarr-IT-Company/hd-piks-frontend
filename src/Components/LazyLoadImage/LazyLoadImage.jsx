import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types'; 
import { Skeleton } from 'antd';
import './LazyLoadImage.css';
const LazyLoadImage = React.memo(({ src, alt }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef();
    const handleObserver = useCallback((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setIsVisible(true);
            }
        });
    }, []);
    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver);
        if (imgRef.current) {
            observer.observe(imgRef.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [handleObserver]);
    return (
        <div style={{ position: 'relative', height: 'auto', transition: 'opacity 0.3s ease-in-out' }}>
            {!isLoaded && (
                <Skeleton.Image
                    className="w-100"
                    style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: 8,
                        animation: 'skeleton-load 1s linear infinite',
                    }}
                    active
                />
            )}
            <img
                ref={imgRef}
                src={isVisible ? src : ''}
                alt={alt}
                style={{
                    width: '100%',
                    borderRadius: '8px',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                }}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
            />
        </div>
    );
});
LazyLoadImage.propTypes = {
    src: PropTypes.string.isRequired,   
    alt: PropTypes.string.isRequired    
};

LazyLoadImage.displayName = 'LazyLoadImage';

export default LazyLoadImage;
