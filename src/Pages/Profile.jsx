import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProfileBanner1 from '../Components/ProfileBanner1/ProfileBanner1';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import '../Components/DashboardShell/DashboardShell.css';
import { useProfile } from '../Context/ProfileContext';

function Profile() {
  const location = useLocation();
  const { setShowContributorForm } = useProfile();

  useEffect(() => {
    if (location.pathname === '/profile/contributor') {
      setShowContributorForm(true);
    } else {
      setShowContributorForm(false);
    }
  }, [location.pathname, setShowContributorForm]);

  return (
    <DashboardShell>
      <ProfileBanner1 />
    </DashboardShell>
  );
}

export default Profile;
