import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import api from '../Services/api';
import { API_ENDPOINTS } from '../config/api.config';
import Cookies from 'js-cookie';
import '../Components/DashboardShell/DashboardShell.css';
import { message } from 'antd';
import './Collections.css';

function Collections() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const userId = Cookies.get('id');
  const navigate = useNavigate();

  const filteredCollections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const searched = !normalizedQuery
      ? collections
      : collections.filter((col) =>
          `${col.name || ''} ${col.description || ''}`.toLowerCase().includes(normalizedQuery)
        );

    const sorted = [...searched];
    if (sortBy === 'name') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'items') {
      sorted.sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0));
    } else {
      sorted.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      );
    }
    return sorted;
  }, [collections, query, sortBy]);

  const totalItems = useMemo(
    () => collections.reduce((sum, col) => sum + (col.items?.length || 0), 0),
    [collections]
  );

  const handleEdit = (col) => {
    setEditId(col._id);
    setEditName(col.name);
    setEditDescription(col.description || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    const trimmedDescription = editDescription.trim();
    if (!editId || !trimmedName) return;
    try {
      setLoading(true);
      await api.patch(API_ENDPOINTS.COLLECTIONS + '/update', {
        collectionId: editId,
        name: trimmedName,
        description: trimmedDescription
      });
      setEditId(null);
      setEditName('');
      setEditDescription('');
      message.success('Collection updated');
      fetchCollections();
    } catch (error) {
      console.error('Failed to update collection', error);
      message.error('Failed to update collection');
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
      message.success('Collection deleted');
      fetchCollections();
    } catch (error) {
      console.error('Failed to delete collection', error);
      message.error('Failed to delete collection');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.COLLECTIONS, { params: { userId } });
      const raw = response.data?.data || [];

      // Fallback: if backend returns item IDs (not populated objects), fetch collection items
      // and hydrate a cover image URL so preview card still renders.
      const hydrated = await Promise.all(
        raw.map(async (col) => {
          const directCover =
            col.coverUrl ||
            col.items?.find((item) => item && typeof item === 'object' && item.imageUrl)?.imageUrl ||
            '';

          if (directCover || !(col.items?.length > 0)) {
            return { ...col, coverUrl: directCover || null };
          }

          try {
            const itemsRes = await api.get(API_ENDPOINTS.COLLECTIONS + '/items', {
              params: { collectionId: col._id }
            });
            const items = itemsRes.data?.data || [];
            const coverFromItems = items.find((item) => item?.imageUrl)?.imageUrl || null;
            return { ...col, coverUrl: coverFromItems };
          } catch {
            return { ...col, coverUrl: null };
          }
        })
      );

      setCollections(hydrated);
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
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName || !userId) {
      message.warning('Collection name is required');
      return;
    }
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.COLLECTIONS, {
        userId,
        name: trimmedName,
        description: trimmedDescription
      });
      setName('');
      setDescription('');
      message.success('Collection created');
      fetchCollections();
    } catch (error) {
      console.error('Failed to create collection', error);
      message.error('Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <section className="dash-most">
        <div className="collections-header">
          <div>
            <h4 className="mb-1">Collections</h4>
            <span className="dash-most__meta">Organize your saved downloads</span>
          </div>
          <div className="collections-stats">
            <div className="collections-stat">
              <div className="collections-stat__value">{collections.length}</div>
              <div className="collections-stat__label">Collections</div>
            </div>
            <div className="collections-stat">
              <div className="collections-stat__value">{totalItems}</div>
              <div className="collections-stat__label">Saved Assets</div>
            </div>
          </div>
        </div>

        <form className="collections-create" onSubmit={handleCreate}>
          <div className="collections-create__title">Create new collection</div>
          <div className="collections-create__grid">
            <div className="profile-stack">
              <label className="profile-label">Name *</label>
              <input
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. YouTube collection"
                maxLength={60}
                required
              />
            </div>
            <div className="profile-stack">
              <label className="profile-label">Description</label>
              <input
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will you store here?"
                maxLength={120}
              />
            </div>
            <div className="profile-stack collections-create__submit">
              <button type="submit" className="dash-shell__upload-btn" disabled={loading || !name.trim()}>
                {loading ? 'Saving...' : 'Create collection'}
              </button>
            </div>
          </div>
        </form>

        <div className="collections-toolbar">
          <div className="profile-stack">
            <label className="profile-label">Search</label>
            <input
              className="form-control"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or description"
            />
          </div>
          <div className="profile-stack" style={{ alignSelf: 'end' }}>
            <label className="profile-label">Sort by</label>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="updated">Recently updated</option>
              <option value="items">Most items</option>
              <option value="name">A-Z</option>
            </select>
          </div>
        </div>

        {loading && <div className="dash-most__loading">Loading...</div>}
        {!loading && filteredCollections.length === 0 && (
          <div className="collections-empty">
            <div className="collections-empty__title">No collections found</div>
            <div className="collections-empty__sub">
              Create your first collection or adjust your search.
            </div>
          </div>
        )}

        <div className="collections-grid">
          {filteredCollections.map((col) => {
            const cover =
              col.coverUrl ||
              col.items?.find((item) => item && typeof item === 'object' && item.imageUrl)?.imageUrl ||
              null;
            return (
              <div key={col._id} className="collections-card">
                <div className="collections-card__cover">
                  {cover ? (
                    <img src={cover} alt={col.name} className="collections-card__cover-img" />
                  ) : (
                    <div className="collections-card__cover-fallback">No Preview</div>
                  )}
                  <div className="collections-card__count">{col.items?.length || 0} items</div>
                </div>

                <div className="collections-card__body">
                  {editId === col._id ? (
                    <form onSubmit={handleEditSubmit} className="collections-card__edit">
                      <input
                        className="form-control"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Collection name"
                        required
                      />
                      <input
                        className="form-control"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                      />
                      <div className="collections-card__actions">
                        <button type="submit" className="dash-shell__upload-btn" disabled={loading}>Save</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setEditId(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="dash-most__title">{col.name}</div>
                      <div className="dash-most__author collections-card__desc">
                        {col.description || 'No description'}
                      </div>
                      <div className="collections-card__updated">
                        Updated {new Date(col.updatedAt || col.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                      <div className="collections-card__actions">
                        <button className="dash-shell__upload-btn" onClick={() => navigate(`/collections/${col._id}`)} disabled={loading}>
                          Open
                        </button>
                        <button className="btn btn-outline-primary" onClick={() => handleEdit(col)} disabled={loading}>
                          Edit
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(col._id)} disabled={loading}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}

export default Collections;
