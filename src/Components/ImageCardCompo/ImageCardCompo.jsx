import React, { useDeferredValue, useTransition, useState } from 'react';
import { ImageListItem } from '@mui/material';
import LazyLoadImage from '../LazyLoadImage/LazyLoadImage';
import CollectionSelectModal from '../CollectionSelectModal';
import './ImageCardCompo.css';

const ImageCard = React.memo(({ img, user, onClick }) => {
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const deferredImg = useDeferredValue(img);
    const deferredUser = useDeferredValue(user);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(() => {
            if (onClick) onClick();
        });
    };

    return (
        <>
            <ImageListItem
                key={deferredImg._id}
                onClick={handleClick}
                className={`card-container ${isPending ? 'loading' : ''}`}
            >
                <div className="image-container">
                    <LazyLoadImage
                        src={deferredImg.imageUrl}
                        alt="Image"
                        className="card-img"
                    />
                    <div className="overlay">
                        <h5 className="mb-2">
                            {deferredImg.subcategory ||
                                deferredImg.category ||
                                deferredImg.subsubcategory}
                        </h5>
                        {deferredUser && (
                            <div className="d-flex align-items-center">
                                <img
                                    src={deferredUser.profileImage}
                                    className="rounded-circle me-2"
                                    alt="Profile Pic"
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        objectFit: 'cover',
                                    }}
                                />
                                <p
                                    className="mb-0"
                                    style={{ fontSize: '14px' }}
                                >
                                    {deferredUser.name}
                                </p>
                            </div>
                        )}
                        <button
                            className="dash-shell__upload-btn"
                            style={{ marginTop: 8 }}
                            onClick={e => {
                                e.stopPropagation();
                                setShowCollectionModal(true);
                            }}
                        >
                            Save to Collection
                        </button>
                    </div>
                </div>
            </ImageListItem>
            <CollectionSelectModal
                show={showCollectionModal}
                onClose={() => setShowCollectionModal(false)}
                assetId={deferredImg._id}
                onSuccess={() => {
                    // Optionally show a toast or feedback
                }}
            />
        </>
    );
});

export default ImageCard;
