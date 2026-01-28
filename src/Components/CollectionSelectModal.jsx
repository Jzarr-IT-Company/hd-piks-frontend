import React, { useEffect, useState } from 'react';
import api from '../Services/api';
import { API_ENDPOINTS } from '../config/api.config';
import Cookies from 'js-cookie';

const CollectionSelectModal = ({ show, onClose, assetId, onSuccess }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = Cookies.get('id');

  useEffect(() => {
    if (show && userId) {
      setLoading(true);
      api.get(API_ENDPOINTS.COLLECTIONS, { params: { userId } })
        .then(res => setCollections(res.data?.data || []))
        .catch(() => setCollections([]))
        .finally(() => setLoading(false));
    }
  }, [show, userId]);

  const handleSelect = async (collectionId) => {
    if (!assetId) {
      alert('No asset selected!');
      return;
    }
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.COLLECTION_ADD_ASSET, { collectionId, assetId });
      alert('Asset added to collection!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      alert('Failed to add to collection');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.3)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div
        style={{
          background: '#fff', padding: 24, borderRadius: 8, maxWidth: 400, width: '100%',
          boxShadow: '0 2px 16px rgba(0,0,0,0.15)', position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h5>Select a Collection</h5>
        {loading && <div>Loading...</div>}
        {!loading && collections.length === 0 && <div>No collections found.</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {collections.map(col => (
            <li key={col._id} style={{ margin: '8px 0' }}>
              <button
                className="dash-shell__upload-btn"
                style={{ width: '100%' }}
                onClick={() => handleSelect(col._id)}
                disabled={loading}
              >
                {col.name}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="dash-shell__upload-btn"
          style={{ marginTop: 16 }}
          onClick={onClose}
          disabled={loading}
        >Cancel</button>
      </div>
    </div>
  );
};

export default CollectionSelectModal;

