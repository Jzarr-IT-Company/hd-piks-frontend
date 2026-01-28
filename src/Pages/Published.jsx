import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import '../Components/DashboardShell/DashboardShell.css';
import ContributorFilesList from '../Components/ContributorFilesList/ContributorFilesList';
import useUserAssets from '../hooks/useUserAssets';
import { useGlobalState } from '../Context/Context';

function Published() {
  const { userData, creatorData } = useGlobalState();
  const navigate = useNavigate();
  const contributorStatus = creatorData?.status || 'not-applied';
  const isContributorApproved = userData?.role === 'creator' || contributorStatus === 'approved';
  const { published, counts, loading, error } = useUserAssets();

  useEffect(() => {
    if (creatorData && !isContributorApproved) {
      navigate('/profile/contributor', { replace: true });
    }
  }, [creatorData, isContributorApproved, navigate]);

  return (
    <DashboardShell fileCounts={counts}>
      <ContributorFilesList
        items={published}
        loading={loading}
        error={error}
        emptyTitle="No published files"
        emptyBody="Approved files will show up here. Upload new work or wait for reviews to complete."
      />
    </DashboardShell>
  );
}

export default Published;
