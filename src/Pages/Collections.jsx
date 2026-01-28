import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import api from '../Services/api';
import { API_ENDPOINTS } from '../config/api.config';
import Cookies from 'js-cookie';
import '../Components/DashboardShell/DashboardShell.css';

function Collections() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const userId = Cookies.get('id');
  const navigate = useNavigate();
  const handleEdit = (col) => {
    setEditId(col._id);
    setEditName(col.name);
    setEditDescription(col.description || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editId || !editName) return;
    try {
      setLoading(true);
      await api.patch(API_ENDPOINTS.COLLECTIONS + '/update', {
        collectionId: editId,
        name: editName,
        description: editDescription
      });
      setEditId(null);
      setEditName('');
      setEditDescription('');
      fetchCollections();
    } catch (error) {
      console.error('Failed to update collection', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      setLoading(true);
      await api.delete(API_ENDPOINTS.COLLECTIONS + '/delete', {
        data: { collectionId: id }
      });
      fetchCollections();
    } catch (error) {
      console.error('Failed to delete collection', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.COLLECTIONS, { params: { userId } });
      setCollections(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load collections', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !userId) return;
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.COLLECTIONS, { userId, name, description });
      setName('');
      setDescription('');
      fetchCollections();
    } catch (error) {
      console.error('Failed to create collection', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <section className="dash-most">
        <div className="dash-most__header" style={{ marginBottom: 16 }}>
          <h4>Collections</h4>
          <span className="dash-most__meta">Organize your saved downloads</span>
        </div>

        <form className="profile-grid" onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <div className="profile-stack">
            <label className="profile-label">Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. YouTube collection"
            />
          </div>
          <div className="profile-stack">
            <label className="profile-label">Description</label>
            <input
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you store here?"
            />
          </div>
          <div className="profile-stack" style={{ alignSelf: 'end' }}>
            <button type="submit" className="dash-shell__upload-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Create collection'}
            </button>
          </div>
        </form>

        {loading && <div className="dash-most__loading">Loading...</div>}
        {!loading && collections.length === 0 && <div className="dash-most__loading">No collections yet</div>}
        <div className="dash-most__list">
          {collections.map((col) => (
            <div key={col._id} className="dash-most__item" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
              <div className="dash-most__info">
                {editId === col._id ? (
                  <form onSubmit={handleEditSubmit} style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="form-control"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Collection name"
                      required
                    />
                    <input
                      className="form-control"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Description"
                    />
                    <button type="submit" className="dash-shell__upload-btn" disabled={loading}>Save</button>
                    <button type="button" className="dash-shell__upload-btn" onClick={() => setEditId(null)}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <div className="dash-most__title">{col.name}</div>
                    <div className="dash-most__author" style={{ marginTop: 4 }}>{col.description || 'No description'}</div>
                  </>
                )}
              </div>
              <div className="dash-most__downloads">{col.items?.length || 0} items</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="dash-shell__upload-btn" onClick={() => navigate(`/collections/${col._id}`)} disabled={loading}>View</button>
                <button className="dash-shell__upload-btn" onClick={() => handleEdit(col)} disabled={loading}>Edit</button>
                <button className="dash-shell__upload-btn" onClick={() => handleDelete(col._id)} disabled={loading}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

export default Collections;
