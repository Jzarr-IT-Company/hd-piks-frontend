import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Spin } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import DashboardBanner3 from '../Components/DashboardBanner3/DashboardBanner3';
import { useAuth } from '../Context/AuthContext';
import api from '../Services/api';
import { API_ENDPOINTS } from '../config/api.config';
import { getContributorState } from '../utils/contributorStatus';
import useUserAssets from '../hooks/useUserAssets';
import '../Components/DashboardShell/DashboardShell.css';

function Dashboard() {
  const { userData, creatorData } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { counts: assetCounts } = useUserAssets();
  const id = Cookies.get('id');
  const token = Cookies.get('token');

  const contributor = getContributorState(userData, creatorData);
  const isContributorApproved = contributor.isApproved;

  useEffect(() => {
    if (creatorData && !isContributorApproved) {
      navigate('/profile/contributor', { replace: true });
    }
  }, [creatorData, isContributorApproved, navigate]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await api.post(API_ENDPOINTS.GET_IMAGES_BY_CREATOR_ID, { id });
        if (response.data.status === 200) {
          setItems(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.GET_IMAGES_BY_CREATOR_ID, { id });
      if (response.data.status === 200) {
        setItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error refreshing gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  if (id && token && !userData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spin />
      </div>
    );
  }

  const shellCounts = {
    uploads: assetCounts.total ?? 0,
    pending: assetCounts.pending ?? 0,
    rejected: assetCounts.rejected ?? 0,
    published: assetCounts.published ?? 0,
  };

  return (
    <DashboardShell fileCounts={shellCounts}>
      <section className="dash-highlight dash-highlight--welcome">
        <div className="dash-highlight__content">
          <div className="dash-highlight__eyebrow">Let's get you started</div>
          <h3 className="dash-highlight__title">WELCOME TO THE CONTRIBUTOR PANEL!</h3>
          <p className="dash-highlight__body">
            Keep your dashboard focused on operations. Detailed analytics is now available under the Stats section.
          </p>
          <ul className="dash-highlight__list">
            <li>
              <span className="dash-highlight__icon" aria-hidden></span>
              <div>Read our <Link className="dash-highlight__link" to="/company/help-center">Guidelines</Link> before uploading.</div>
            </li>
            <li>
              <span className="dash-highlight__icon" aria-hidden></span>
              <div>Upload high-quality resources with clear metadata for faster approvals.</div>
            </li>
            <li>
              <span className="dash-highlight__icon" aria-hidden></span>
              <div>Use <strong>Stats</strong> in the sidebar to monitor downloads, likes and top-performing assets.</div>
            </li>
          </ul>
          <div className="dash-highlight__cta-row">
            <button className="dash-shell__upload-btn" onClick={() => window.location.assign('/upload')}>
              Start creating
            </button>
          </div>
        </div>
        <div className="dash-highlight__visual" aria-hidden>
          <span className="dash-highlight__visual-icon">[]</span>
        </div>
      </section>

      <section>
        <DashboardBanner3 items={items} loadingExternal={loading} refreshExternal={refresh} />
      </section>
    </DashboardShell>
  );
}

export default Dashboard;
