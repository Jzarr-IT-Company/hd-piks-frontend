// import React, { useState, useRef } from 'react';
import React, { useEffect, useMemo, useState , useRef } from 'react';
import './DashboardShell.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../Context/Context';
import { LayoutDashboard, Layers, BarChart3, Sparkles, BookOpenCheck, ShieldCheck, FileText, Inbox, MessageSquare, CreditCard, RefreshCw, Users, ArrowUpToLine, User, Mail, MapPin, Globe2, Link2, Sparkles as SparkleIcon, AlignLeft, Briefcase, Calendar, Instagram, Facebook } from 'lucide-react';
import bydefault from './bydefault';
import axios from 'axios';
import EditableCreatorProfile from '../ProfileBanner1UploadImages/EditableCreatorProfile';


function DashboardShell({ children, rightPanel, fileCounts = {} }) {
  const { userData, creatorData, setShowContributorForm } = useGlobalState();
  // Loading fallback if userData or creatorData are not loaded yet
  if (userData === undefined || creatorData === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }
  // Handler for Creator Profile panel
  const [showCreatorProfile, setShowCreatorProfile] = useState(false);
  const handleCreatorProfile = () => {
    console.log('Creator Profile button clicked');
    setShowCreatorProfile(true);
  };
  const handleCloseCreatorProfile = () => {
    setShowCreatorProfile(false);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({ Files: true, Personal: true });
  const isSettingsPage = location.pathname === '/setting';
    
  const contributorStatus = creatorData?.status || 'not-applied';
  const rejectionReason = creatorData?.rejectionReason;
  const isContributorApproved = userData?.role === 'creator' || contributorStatus === 'approved';
  const isContributorPending = contributorStatus === 'pending';
  const statusLabel = contributorStatus === 'approved' ? 'Approved' : contributorStatus === 'pending' ? 'Pending' : contributorStatus === 'rejected' ? 'Rejected' : 'Not applied';
  const statusMessage = contributorStatus === 'approved'
    ? 'Your creator profile is approved. You can switch to the contributor dashboard.'
    : contributorStatus === 'pending'
      ? 'Your application is under review. This can take 2-4 business days.'
      : contributorStatus === 'rejected'
        ? `Application rejected${rejectionReason ? `: ${rejectionReason}` : ''}. Update your creator profile to reapply.`
        : 'Start your creator application to sell your work.';
  const flatActive = useMemo(() => location.pathname, [location.pathname]);
  const personalMenu = useMemo(() => ([
    { label: 'Collections', to: '/collections', count: '', Icon: Layers },
    { label: 'Profile', to: '/profile', count: '', Icon: Users },
    { label: 'Settings', to: '/setting', count: statusLabel, Icon: Sparkles },
  ]), [statusLabel]);

  const personalOnlyRoutes = useMemo(() => ['/profile', '/collections', '/setting', '/profile/contributor'], []);
  const isInPersonalArea = useMemo(
    () => personalOnlyRoutes.some((path) => flatActive.startsWith(path)),
    [flatActive, personalOnlyRoutes]
  );

  const navItems = useMemo(() => {
    const counts = {
      pending: fileCounts.pending ?? 0,
      rejected: fileCounts.rejected ?? 0,
      published: fileCounts.published ?? 0,
      uploads: fileCounts.uploads ?? 0,
    };

    if (!isContributorApproved || isInPersonalArea) {
      return [
        {
          label: 'Personal',
          Icon: Users,
          children: personalMenu,
        },
      ];
    }

    return [
      { label: 'Dashboard', to: '/dashboard', Icon: LayoutDashboard },
      {
        label: 'Files',
        Icon: Layers,
        children: [
          { label: 'Upload', to: '/upload', count: counts.uploads, Icon: ArrowUpToLine },
          { label: 'Under revision', to: '/files/under-revision', count: counts.pending, Icon: ShieldCheck },
          { label: 'Rejections', to: '/files/rejections', count: counts.rejected, Icon: FileText },
          { label: 'Published', to: '/files/published', count: counts.published, Icon: Inbox },
        ],
      },
      { label: 'Stats', to: '/dashboard', Icon: BarChart3 },
      { label: 'Search Trends', to: '/dashboard', Icon: Sparkles },
      { label: 'Guidelines', to: '/dashboard', Icon: BookOpenCheck },
      { label: 'Contact', to: '/dashboard', Icon: MessageSquare },
      { label: 'Billing and invoices', to: '/dashboard', Icon: CreditCard },
    ];
  }, [fileCounts.pending, fileCounts.published, fileCounts.rejected, fileCounts.uploads, isContributorApproved, isInPersonalArea, personalMenu]);

  const brandText = useMemo(
    () => (isInPersonalArea ? 'HDPiks User' : isContributorApproved ? 'HDPiks Contributor' : 'HDPiks User'),
    [isContributorApproved, isInPersonalArea]
  );

  const isContributorView = isContributorApproved && !isInPersonalArea;
  const avatarSrc = isContributorView
    ? creatorData?.profile?.profileImage?.url
      || creatorData?.profile?.avatar?.url
      || creatorData?.profile?.avatarUrl
      || creatorData?.profile?.image
      || userData?.profileImage?.url
      || userData?.profileImage
      || bydefault
    : userData?.profileImage?.url
      || userData?.profileImage
      || creatorData?.profile?.profileImage?.url
      || bydefault;

  const displayName = isContributorView
    ? creatorData?.profile?.displayName || userData?.name || 'Contributor'
    : userData?.name || creatorData?.profile?.displayName || 'User';

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isCreator = userData?.role === 'creator';
  const isPending = contributorStatus === 'pending';
  const statusPillStorageKey = 'dash-status-pill-hidden';
  const [showStatusPill, setShowStatusPill] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(statusPillStorageKey) !== 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!showStatusPill) {
      localStorage.setItem(statusPillStorageKey, 'true');
    }
  }, [showStatusPill]);

  const handleSwitchContributor = () => {
    if (isPending) return;
    if (isInPersonalArea) {
      if (isContributorApproved) {
        navigate('/dashboard');
      } else {
        setShowContributorForm(true);
        navigate('/profile/contributor');
      }
      return;
    }
    navigate('/profile');
  };

  const renderContributorButton = () => {
    let label = isInPersonalArea ? 'Go to contributor panel' : 'Switch to user panel';
    let disabled = false;
    if (!isContributorApproved && isPending) {
      label = 'Application pending';
      disabled = true;
    } else if (!isContributorApproved && contributorStatus === 'rejected') {
      label = 'Re-apply as contributor';
    }

    return (
      <div className="dash-switch">
        <button
          className="dash-shell__upload-btn"
          onClick={handleSwitchContributor}
          disabled={disabled}
        >
          <RefreshCw size={16} className="me-2" />
          {label}
        </button>
        {showStatusPill && (
          <span className={`dash-status dash-status--${contributorStatus}`}>
            {contributorStatus}
            <button
              type="button"
              className="dash-status__close"
              onClick={() => setShowStatusPill(false)}
              aria-label="Dismiss status"
            >
              ×
            </button>
          </span>
        )}
        {isSettingsPage && (
          <div className="dash-status__message">{statusMessage}</div>
        )}
      </div>
    );
  };

  return (
    <div className="dash-shell">
      <aside className="dash-shell__sidebar">
        <div className="dash-shell__brand">{brandText}</div>
        <button
          className="btn btn-outline-primary w-100 mb-3 d-flex align-items-center justify-content-start"
          style={{ fontWeight: 600, fontSize: '1rem' }}
          onClick={handleCreatorProfile}
        >
          <User size={18} className="me-2" />
          Creator Profile
        </button>
        <nav className="dash-shell__nav">
          {navItems.map((item) => {
            if (item.children) {
              const open = openGroups[item.label];
              return (
                <div key={item.label} className="dash-shell__nav-group">
                  <button type="button" className="dash-shell__nav-parent" onClick={() => toggleGroup(item.label)}>
                    <div className="dash-shell__nav-parent-main">
                      {item.Icon ? <item.Icon size={16} className="dash-shell__nav-icon" aria-hidden="true" /> : null}
                      <span>{item.label}</span>
                    </div>
                    <span className={`dash-shell__chevron ${open ? 'open' : ''}`} aria-hidden="true" />
                  </button>
                  <div className={`dash-shell__subnav ${open ? 'open' : ''}`}>
                    {item.children.map((child) => {
                      const active = flatActive === child.to;
                      return (
                        <Link
                          key={child.label}
                          to={child.to}
                          className={`dash-shell__nav-item dash-shell__nav-item--child ${active ? 'active' : ''}`}
                        >
                          <span className="dash-shell__nav-label d-flex align-items-center gap-1">
                            {child.Icon ? <child.Icon size={14} /> : null}
                            {child.label}
                          </span>
                          <span className="dash-shell__badge">{child.count ?? 0}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const active = flatActive === item.to;
             return (
               <Link key={item.label} to={item.to} className={`dash-shell__nav-item ${active ? 'active' : ''}`}>
                 {item.Icon ? <item.Icon size={16} className="dash-shell__nav-icon" aria-hidden="true" /> : null}
                 <span>{item.label}</span>
               </Link>
             );
          })}
        </nav>
      </aside>

      <main className="dash-shell__main">
        <header className="dash-shell__topbar">
          <div className="dash-shell__user">
            <img src={avatarSrc} alt="User" className="dash-shell__avatar" />
            <div>
              <div className="dash-shell__username">{displayName}</div>
              <div className="dash-shell__level">{isContributorView ? 'Contributor' : 'User'}</div>
            </div>
          </div>
          <div className="dash-top-actions">
            {renderContributorButton()}
            {isContributorApproved && ( 
              <button className="dash-shell__upload-btn" onClick={() => window.location.assign('/upload')}> 
                Upload files 
              </button> 
            )} 
          </div>
        </header>

        <div className="dash-shell__content">
          {showCreatorProfile ? (
            <div className="container mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold mb-0">Creator Profile</h3>
                <button className="btn btn-outline-secondary" onClick={handleCloseCreatorProfile}>Close</button>
              </div>
              {/* Display creator profile data here */}
              <EditableCreatorProfile onClose={handleCloseCreatorProfile} />
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      {rightPanel && (
        <aside className="dash-shell__right">
          {rightPanel}
        </aside>
      )}
    </div>
  );
}

export default DashboardShell;
