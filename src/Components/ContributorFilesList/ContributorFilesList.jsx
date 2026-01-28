import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import api from '../../Services/api.js';
import './ContributorFilesList.css';

const statusMeta = {
  approved: { label: 'Published', tone: 'published' },
  rejected: { label: 'Rejected', tone: 'rejected' },
  pending: { label: 'Under revision', tone: 'pending' },
};

const resolveStatus = (item = {}) => {
  if (item.rejected) return 'rejected';
  if (item.approved) return 'approved';
  return 'pending';
};

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

function ContributorFilesList({ items = [], loading, error, emptyTitle, emptyBody }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="dash-empty">
        <div className="dash-empty__icon" aria-hidden>⏳</div>
        <h3 className="dash-empty__title">Loading your files…</h3>
        <p className="dash-empty__body">We are fetching your uploads. This should only take a moment.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dash-empty">
        <div className="dash-empty__icon" aria-hidden>!</div>
        <h3 className="dash-empty__title">Could not load files</h3>
        <p className="dash-empty__body">{error}</p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="dash-empty">
        <div className="dash-empty__icon" aria-hidden>i</div>
        <h3 className="dash-empty__title">{emptyTitle}</h3>
        <p className="dash-empty__body">{emptyBody}</p>
        <button className="dash-empty__btn" onClick={() => navigate('/upload')}>Upload files</button>
      </section>
    );
  }

  return (
    <div className="files-grid">
      {items.map((item) => {
        const statusKey = resolveStatus(item);
        const status = statusMeta[statusKey];
        const uploadDate = item.createdAt || item.fileMetadata?.uploadedAt;
        return (
          <article key={item._id} className="file-card">
            <div className="file-card__thumb">
              {item.imageUrl ? (
                (item.imagetype && item.imagetype.startsWith('video/')) ? (
                  <video src={item.imageUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}>
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img src={item.imageUrl} alt={item.title || item.subcategory || 'Uploaded file'} loading="lazy" />
                )
              ) : (
                <div className="file-card__placeholder">No preview</div>
              )}
              <span className={`file-card__status file-card__status--${status.tone}`}>{status.label}</span>
            </div>
            <div className="file-card__meta">
              <div className="file-card__title" title={item.title || item.subcategory || 'Untitled'}>
                {item.title || item.subcategory || 'Untitled'}
              </div>
              <div className="file-card__sub">
                {(item.category || 'Uncategorized')}{item.subcategory ? ` · ${item.subcategory}` : ''}
              </div>
              <div className="file-card__footer">
                <span className="file-card__date">Uploaded {formatDate(uploadDate)}</span>
                {item._id && (
                  <>
                    <button type="button" className="file-card__action" onClick={() => navigate(`/asset/${item._id}`)}>
                      View
                    </button>
                    <button
                      type="button"
                      className="file-card__action file-card__action--edit"
                      onClick={() => {
                        // Store edit data in sessionStorage and navigate to /upload
                        sessionStorage.setItem('editAsset', JSON.stringify(item));
                        navigate(`/upload?edit=${item._id}`);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="file-card__action file-card__action--delete"
                      onClick={async () => {
                        Modal.confirm({
                          title: 'Delete Asset',
                          content: 'Are you sure you want to delete this asset? This action cannot be undone.',
                          okText: 'Delete',
                          okType: 'danger',
                          cancelText: 'Cancel',
                          onOk: async () => {
                            try {
                              const resp = await api.delete(`/images/${item._id}`);
                              if (resp.data.status === 200) {
                                message.success('Asset deleted');
                                window.location.reload();
                              } else {
                                message.error(resp.data.message || 'Delete failed');
                              }
                            } catch (err) {
                              message.error('Delete failed');
                            }
                          },
                        });
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default ContributorFilesList;
