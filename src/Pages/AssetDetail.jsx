import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AssetDetailView from '../Components/AssetDetailView/AssetDetailView';
import TopNavOnly from '../Components/AppNavbar/TopNavOnly';

function AssetDetail() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname, location.search]);

    return (
        <>
            <TopNavOnly />
            <AssetDetailView />
        </>
    );
}

export default AssetDetail;
