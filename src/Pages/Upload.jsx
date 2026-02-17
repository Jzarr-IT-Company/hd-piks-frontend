import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadBanner1 from '../Components/UploadBanner1/UploadBanner1';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import '../Components/DashboardShell/DashboardShell.css';
import { useAuth } from '../Context/AuthContext';
import { getContributorState } from '../utils/contributorStatus';

function Upload() {
    const { userData, creatorData } = useAuth();
    const navigate = useNavigate();
    const contributor = getContributorState(userData, creatorData);
    const isContributorApproved = contributor.isApproved;

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
