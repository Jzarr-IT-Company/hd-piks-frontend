import React from 'react';
import AssetDetailView from '../Components/AssetDetailView/AssetDetailView';
import TopNavOnly from '../Components/AppNavbar/TopNavOnly';

function AssetDetail() {
    return (
        <>
            <TopNavOnly />
            <AssetDetailView />
        </>
    );
}

export default AssetDetail;
