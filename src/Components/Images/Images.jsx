import React, { useState, useEffect, useMemo, useTransition, useDeferredValue } from 'react';
import { ImageList } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import SkeletonCard from '../SkeletonCard/SkeletonCard';
import UserData from '../../UseQuerry/UserData';
import UseImages from '../../UseQuerry/UseImages';
import ImageCard from '../ImageCardCompo/ImageCardCompo';

const Images = React.memo(() => {
    const [columns, setColumns] = useState(4);
    const navigate = useNavigate();
    const [loadedImages, setLoadedImages] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isPending, startTransition] = useTransition();
    const deferredImages = useDeferredValue(loadedImages);
    const { data: users = [] } = UserData();
    const { data: images = [], isLoading, error } = UseImages();
    const userMap = useMemo(
        () => users.reduce((map, user) => ({ ...map, [user._id]: user }), {}),
        [users]
    );
    
    useEffect(() => {
        const cachedImages = sessionStorage.getItem('images');
        if (cachedImages) {
            setLoadedImages(JSON.parse(cachedImages));
            setIsDataLoaded(true);
        } else if (images.length > 0 && !isDataLoaded) {
            sessionStorage.setItem('images', JSON.stringify(images));
            setLoadedImages(images);
            setIsDataLoaded(true);
        }
    }, [images, isDataLoaded]);

    const updateColumns = useMemo(
        () =>
            debounce(() => {
                setColumns(window.innerWidth < 567 ? 2 : window.innerWidth < 900 ? 3 : 4);
            }, 100),
        []
    );

    useEffect(() => {
        window.addEventListener('resize', updateColumns);
        updateColumns();
        return () => window.removeEventListener('resize', updateColumns);
    }, [updateColumns]);

    if (isLoading && !isDataLoaded) return <SkeletonCard />;
    if (error) return <div>Error: {error.message}</div>;

    const handleNextBtn = () => {
        startTransition(() => {
            navigate('/');
        });
    };

    return (
        <div className="container py-4">
            <ImageList
                sx={{ width: '100%', height: 'auto' }}
                variant="masonry"
                cols={columns}
                gap={8}
            >
                {deferredImages.length === 0 ? (
                    <p>No Images Found</p>
                ) : (
                    deferredImages.slice(20, 40).map((img) => (
                        <React.Suspense key={img._id} fallback={<SkeletonCard />}>
                            <ImageCard
                                key={img._id}
                                img={img}
                                user={userMap[img.userId]}
                                onClick={() => {
                                    startTransition(() => {
                                        navigate(`/detial/images/${img._id}/${img.userId}`);
                                        window.scroll(0, 0);
                                    });
                                }}
                            />
                        </React.Suspense>
                    ))
                )}
            </ImageList>
            {isPending && <div className="loading-spinner">Loading...</div>}
            <div className="d-flex justify-content-center align-items-center">
                <button className="button py-3 px-5" onClick={handleNextBtn}>
                    View More
                </button>
            </div>
        </div>
    );
});

// Set display name for the component
Images.displayName = 'Images';

export default Images;
