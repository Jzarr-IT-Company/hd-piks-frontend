import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import '../Components/DashboardShell/DashboardShell.css';
import ContributorFilesList from '../Components/ContributorFilesList/ContributorFilesList';
import useUserAssets from '../hooks/useUserAssets';
import { useAuth } from '../Context/AuthContext';
import { getContributorState } from '../utils/contributorStatus';

function UnderRevision() {
  const { userData, creatorData } = useAuth();
  const navigate = useNavigate();
  const contributor = getContributorState(userData, creatorData);
  const isContributorApproved = contributor.isApproved;
  const { pending, counts, loading, error } = useUserAssets();

  useEffect(() => {
    if (creatorData && !isContributorApproved) {
      navigate('/profile/contributor', { replace: true });
    }
  }, [creatorData, isContributorApproved, navigate]);

  return (
    <DashboardShell fileCounts={counts}>
      <div className="dash-page-head">
        <div>
          <h2 className="dash-page-title">Files Under Revision</h2>
          <p className="dash-page-sub">Your pending uploads awaiting review. Approved files move to Published; rejected files move to Rejections.</p>
        </div>
      </div>
      <ContributorFilesList
        items={pending}
        loading={loading}
        error={error}
        emptyTitle="Nothing under review yet"
        emptyBody="Upload files to kick off your first review. Approved items will move to Published and rejected ones to Rejections."
      />
    </DashboardShell>
  );
}

export default UnderRevision;
