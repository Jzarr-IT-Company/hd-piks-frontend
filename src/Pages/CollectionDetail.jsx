import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../Services/api';
import { API_ENDPOINTS } from '../config/api.config';
import DashboardShell from '../Components/DashboardShell/DashboardShell';

function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collection, setCollection] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const res = await api.get(API_ENDPOINTS.COLLECTIONS + '/items', { params: { collectionId: id } });
        setAssets(res.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch collection assets', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [id]);

  useEffect(() => {
    // Optionally fetch collection info if needed
    // ...existing code...
  }, [id]);

  const handleRemove = async (assetId) => {
    if (!window.confirm('Remove this asset from collection?')) return;
    setLoading(true);
    try {
      await api.delete(API_ENDPOINTS.COLLECTIONS + '/removeAsset', {
        data: { collectionId: id, assetId }
      });
      setAssets(assets.filter(a => a._id !== assetId));
    } catch (error) {
      console.error('Failed to remove asset', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <section className="dash-most">
        <button onClick={() => navigate(-1)} className="dash-shell__upload-btn" style={{ marginBottom: 16 }}>Back</button>
        <h4>Collection Assets</h4>
        {loading && <div>Loading...</div>}
        {!loading && assets.length === 0 && <div>No assets in this collection.</div>}
        <div className="dash-most__list">
          {assets.map(asset => (
            <div key={asset._id} className="dash-most__item" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
              <div className="dash-most__info">
                <div className="dash-most__title">{asset.title || asset.fileName || 'Untitled'}</div>
                {asset.imageUrl && <img src={asset.imageUrl} alt="" style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover' }} />}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="dash-shell__upload-btn" onClick={() => navigate(`/asset/${asset._id}`)} disabled={loading}>View</button>
                <button className="dash-shell__upload-btn" onClick={() => handleRemove(asset._id)} disabled={loading}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

export default CollectionDetail;
