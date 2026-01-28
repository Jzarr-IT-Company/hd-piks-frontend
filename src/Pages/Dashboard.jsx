import React, { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import DashboardBanner3 from '../Components/DashboardBanner3/DashboardBanner3';
import { useGlobalState } from '../Context/Context';
import api from '../Services/api';
import { API_ENDPOINTS } from '../config/api.config';
import '../Components/DashboardShell/DashboardShell.css';

function Dashboard() {
  const { userData, creatorData } = useGlobalState();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const id = Cookies.get('id');
  const token = Cookies.get('token');

  const contributorStatus = creatorData?.status || 'not-applied';
  const isContributorApproved = userData?.role === 'creator' || contributorStatus === 'approved';

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
        const response = await api.post(API_ENDPOINTS.GET_USER_IMAGES, { id });
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
      const response = await api.post(API_ENDPOINTS.GET_USER_IMAGES, { id });
      if (response.data.status === 200) {
        setItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error refreshing gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const downloads = userData?.download || 0;
    const files = items.length;
    const likes = items.reduce((acc, item) => acc + (item.likes || 0), 0);
    return { downloads, files, likes };
  }, [items, userData]);

  const mostDownloaded = useMemo(() => {
    const sorted = [...items].sort((a, b) => (b.downloads || b.download || 0) - (a.downloads || a.download || 0));
    return sorted.slice(0, 5);
  }, [items]);

  if (id && token && !userData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spin />
      </div>
    );
  }

  return (
    <DashboardShell>

      <section className="dash-highlight dash-highlight--welcome">
        <div className="dash-highlight__content">
          <div className="dash-highlight__eyebrow">Let's get you started</div>
          <h3 className="dash-highlight__title">WELCOME TO THE CONTRIBUTOR PANEL!</h3>
          <p className="dash-highlight__body">
            Now that you're here, let's make the most of our time together. You're one step away from becoming a contributor and converting your resources into earnings. This is what you have to do next:
          </p>
          <ul className="dash-highlight__list">
            <li>
              <span className="dash-highlight__icon" aria-hidden></span>
              <div>To make sure your resources are accepted, read first our <a className="dash-highlight__link" href="/guidelines">Guidelines</a>.</div>
            </li>
            <li>
              <span className="dash-highlight__icon" aria-hidden></span>
              <div>Upload your <strong>150 - 200 best resources only</strong>. Quality is a must: let's see how amazing you are.</div>
            </li>
            <li>
              <span className="dash-highlight__icon" aria-hidden></span>
              <div>We believe in second chances, so you have two attempts to show your true potential.</div>
            </li>
          </ul>
          <div className="dash-highlight__footer">
            To see the onboarding again, <a className="dash-highlight__link" href="/onboarding">click here</a>.
          </div>
          <div className="dash-highlight__cta-row">
            <button className="dash-shell__upload-btn" onClick={() => window.location.assign('/upload')}>
              Submit your first work
            </button>
          </div>
        </div>
        <div className="dash-highlight__visual" aria-hidden>
          <span className="dash-highlight__visual-icon">🖼️</span>
        </div>
      </section>

      <section className="dash-cards">
        <div className="dash-cards__header">
          <h4 className="dash-cards__title">Performance overview</h4>
        </div>
        <div className="dash-card">
          <div className="dash-card__label">Earnings</div>
          <div className="dash-card__value">-- €</div>
          <div className="dash-card__sub">Current month</div>
        </div>
        <div className="dash-card">
          <div className="dash-card__label">Downloads</div>
          <div className="dash-card__value">{stats.downloads}</div>
          <div className="dash-card__sub">Current month</div>
        </div>
        <div className="dash-card">
          <div className="dash-card__label">Likes</div>
          <div className="dash-card__value">{stats.likes}</div>
          <div className="dash-card__sub">Current month</div>
        </div>
        <div className="dash-card">
          <div className="dash-card__label">Files</div>
          <div className="dash-card__value">{stats.files}</div>
          <div className="dash-card__sub">Current month</div>
        </div>
      </section>

    

      <section className="dash-most">
        <div className="dash-most__header">
          <h4>Most downloaded in last month</h4>
          <span className="dash-most__meta">All files</span>
        </div>
        {loading ? (
          <div className="dash-most__loading"><Spin /></div>
        ) : mostDownloaded.length === 0 ? (
          <Empty description="No downloads yet" />
        ) : (
          <div className="dash-most__list">
            {mostDownloaded.map((item, idx) => (
              <div key={item._id || idx} className="dash-most__item">
                <div className="dash-most__rank">{idx + 1}</div>
                <img src={item.imageUrl} alt={item.title || 'Asset'} className="dash-most__thumb" />
                <div className="dash-most__info">
                  <div className="dash-most__title">{item.title || 'Untitled asset'}</div>
                  <div className="dash-most__author">{userData?.name || 'You'}</div>
                </div>
                <div className="dash-most__downloads">{item.downloads || item.download || 0}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <DashboardBanner3 items={items} loadingExternal={loading} refreshExternal={refresh} />
      </section>
    </DashboardShell>
  );
}

export default Dashboard;
