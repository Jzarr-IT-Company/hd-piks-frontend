import React, { useState, useCallback, Suspense, useMemo, useTransition, useDeferredValue } from 'react';
import './HomeBanner.css';

const MockupsCompo = React.lazy(() => import('../MockupsCompo/MockupsCompo'));
const ImagesCompo = React.lazy(() => import('../Images/Images'));
const HomeBanner3 = () => {
    const [selectedComponent, setSelectedComponent] = useState('images');
    const [isPending, startTransition] = useTransition();
    const deferredComponent = useDeferredValue(selectedComponent);
    const handleComponentSelect = useCallback((component) => {
        startTransition(() => {
            setSelectedComponent(component);
        });
    }, []);
    const renderComponent = useMemo(() => {
        switch (deferredComponent) {
            case 'videos':
                return <ImagesCompo categoryname={'image'} />;
            case 'vectors':
                return <ImagesCompo categoryname={'vectors'} />;
            case 'psd':
                return <ImagesCompo categoryname={'psd'} />;
            case 'nfts':
                return <ImagesCompo categoryname={'nfts'} />;
            case 'mockups':
                return <MockupsCompo categoryname={'mockups'} />;
            case 'templates':
                return <ImagesCompo categoryname={'templates'} />;
            case 'images':
            default:
                return <ImagesCompo categoryname={'image'} />;
        }
    }, [deferredComponent]);

    return (
        <div className="container mt-4">
            <div className="row">
                <h3 className="fw-bold display-6">Free Stock Photos</h3>
                <div className="col-12 d-flex justify-content-center align-items-center">
                    <div
                        className="d-flex align-items-center"
                        style={{
                            gap: "0px 10px",
                            overflow: "auto",
                            scrollbarWidth: "none",
                            scrollBehavior: "smooth",
                        }}
                    >
                        <button className="btn btn-dark" onClick={() => handleComponentSelect('images')}>
                            Images
                        </button>
                        <button className="btn btn-dark" onClick={() => handleComponentSelect('videos')}>
                            Videos
                        </button>
                        <button className="btn btn-dark" onClick={() => handleComponentSelect('vectors')}>
                            Vectors
                        </button>
                        <button className="btn btn-dark" onClick={() => handleComponentSelect('psd')}>
                            PSD
                        </button>
                        <button className="btn btn-dark" onClick={() => handleComponentSelect('nfts')}>
                            NFTs
                        </button>
                        <button className="btn btn-dark" onClick={() => handleComponentSelect('mockups')}>
                            Mockups
                        </button>
                        <button className="btn btn-dark" onClick={() => handleComponentSelect('templates')}>
                            Templates
                        </button>
                    </div>
                </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                {isPending && <div>Switching...</div>}
                {renderComponent}
            </Suspense>
        </div>
    );
};

export default React.memo(HomeBanner3);
