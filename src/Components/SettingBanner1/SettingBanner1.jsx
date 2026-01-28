import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../Context/Context';
import './SettingBanner1.css';

function SettingBanner1() {
    const navigate = useNavigate();
    const { creatorData } = useGlobalState();
    const status = creatorData?.status || 'not-applied';
    const reason = creatorData?.rejectionReason;

    const statusLabel = status === 'approved' ? 'Approved' : status === 'pending' ? 'Pending' : status === 'rejected' ? 'Rejected' : 'Not applied';
    const statusClass = `setting-pill setting-pill--${status}`;

    let headline = 'Creator application';
    let body = 'Start your creator application to sell your work.';
    let actionLabel = 'Start application';
    let actionHandler = () => navigate('/profile/contributor');

    if (status === 'pending') {
        headline = 'Application pending';
        body = 'Your application is under review. This can take 2-4 business days.';
        actionLabel = 'View application';
    } else if (status === 'rejected') {
        headline = 'Application rejected';
        body = reason ? `Reason: ${reason}` : 'Your application was rejected. Update your creator profile and resubmit.';
        actionLabel = 'Update and re-apply';
        actionHandler = () => navigate('/profile/contributor');
    } else if (status === 'approved') {
        headline = 'Application approved';
        body = 'Your creator profile is approved. Switch to the contributor dashboard to manage your work.';
        actionLabel = 'Go to contributor panel';
        actionHandler = () => navigate('/dashboard');
    }

    return (
        <div className="setting-card">
            <div className="setting-header">
                <div>
                    <div className="setting-kicker">Creator status</div>
                    <h4 className="setting-title">{headline}</h4>
                    <p className="setting-body">{body}</p>
                </div>
                <span className={statusClass}>{statusLabel}</span>
            </div>

            <div className="setting-actions">
                <button className="setting-btn" onClick={actionHandler}>{actionLabel}</button>
                {status === 'approved' && (
                    <button className="setting-btn setting-btn--ghost" onClick={() => navigate('/profile/contributor')}>
                        View creator profile
                    </button>
                )}
            </div>
        </div>
    );
}

export default SettingBanner1;