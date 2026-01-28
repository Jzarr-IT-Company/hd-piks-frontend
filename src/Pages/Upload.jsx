import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadBanner1 from '../Components/UploadBanner1/UploadBanner1';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import '../Components/DashboardShell/DashboardShell.css';
import { useGlobalState } from '../Context/Context';

function Upload() {
    const { userData, creatorData } = useGlobalState();
    const navigate = useNavigate();
    const contributorStatus = creatorData?.status || 'not-applied';
    const isContributorApproved = userData?.role === 'creator' || contributorStatus === 'approved';

    useEffect(() => {
        if (creatorData && !isContributorApproved) {
            navigate('/profile/contributor', { replace: true });
        }
    }, [creatorData, isContributorApproved, navigate]);

    return (
        <DashboardShell>
            <UploadBanner1 />
        </DashboardShell>
    );
}

export default Upload;