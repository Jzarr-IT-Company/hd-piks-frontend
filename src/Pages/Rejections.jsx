import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import '../Components/DashboardShell/DashboardShell.css';
import ContributorFilesList from '../Components/ContributorFilesList/ContributorFilesList';
import useUserAssets from '../hooks/useUserAssets';
import { useGlobalState } from '../Context/Context';

function Rejections() {
  const { userData, creatorData } = useGlobalState();
  const navigate = useNavigate();
  const contributorStatus = creatorData?.status || 'not-applied';
  const isContributorApproved = userData?.role === 'creator' || contributorStatus === 'approved';
  const { rejected, counts, loading, error } = useUserAssets();

  useEffect(() => {
    if (creatorData && !isContributorApproved) {
      navigate('/profile/contributor', { replace: true });
    }
  }, [creatorData, isContributorApproved, navigate]);

  return (
    <DashboardShell fileCounts={counts}>
      <ContributorFilesList
        items={rejected}
        loading={loading}
        error={error}
        emptyTitle="No rejections yet"
        emptyBody="Great! Nothing has been rejected. Upload more files or check items under review."
      />
    </DashboardShell>
  );
}

export default Rejections;
