import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Delete, CheckCircle, Cancel, Visibility, Search, Edit, UploadFile, DeleteOutline } from '@mui/icons-material';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { getAdminToken } from '../utils/adminAuth';

const emptyProfileImage = {
  url: '',
  s3Key: '',
  fileSize: null,
  mimeType: '',
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // approve | reject | delete
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    bio: '',
    website: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    gender: '',
    dob: '',
    phone: '',
    profession: '',
    skills: '',
    portfolioLinks: [],
    socialLinks: [],
    attachments: [],
    totalDownloads: 0,
    followersCount: 0,
    followingCount: 0,
    profileImage: emptyProfileImage,
  });

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN_CREATORS || '/admin/creators');
      setCreators(res.data.data || []);
    } catch {
      setError('Failed to fetch creators');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCreators(); }, []);

  const filteredCreators = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return creators.filter((creator) => {
      const displayName = creator.profile?.displayName || creator.name || '';
      const email = creator.userId?.email || creator.profile?.email || creator.email || '';
      const bio = creator.profile?.bio || '';
      const status = (creator.status || 'pending').toLowerCase();
      const matchesQuery = !normalizedQuery
        ? true
        : `${displayName} ${email} ${bio}`.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'all' ? true : status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [creators, query, statusFilter]);

  const stats = useMemo(() => {
    const total = creators.length;
    const approved = creators.filter((c) => c.status === 'approved').length;
    const pending = creators.filter((c) => c.status === 'pending').length;
    const rejected = creators.filter((c) => c.status === 'rejected').length;
    return { total, approved, pending, rejected };
  }, [creators]);

  const getStatusColor = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'warning';
    return 'default';
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/creators/${id}`);
      fetchCreators();
    } catch {
      alert('Delete failed');
    }
  };

  const handleStatus = async (id, status) => {
    const payload = status === 'rejected' ? { status, reason: rejectReason.trim() || undefined } : { status };
    try {
      await api.patch(`/admin/creators/${id}/status`, payload);
      fetchCreators();
    } catch {
      alert('Status update failed');
    }
  };

  const openConfirm = (action, creator) => {
    setConfirmAction(action);
    setConfirmTarget(creator);
    setRejectReason('');
    setConfirmDialogOpen(true);
  };

  const handleConfirmProceed = async () => {
    if (!confirmTarget?._id) return;
    if (confirmAction === 'delete') {
      await handleDelete(confirmTarget._id);
    } else if (confirmAction === 'approve') {
      await handleStatus(confirmTarget._id, 'approved');
    } else if (confirmAction === 'reject') {
      if (!rejectReason.trim()) return;
      await handleStatus(confirmTarget._id, 'rejected');
    }

    setConfirmDialogOpen(false);
    setConfirmAction(null);
    setConfirmTarget(null);
    setRejectReason('');
  };

  const openEdit = (creator) => {
    const profile = creator?.profile || {};
    const userEmail = creator?.userId?.email || creator?.email || '';
    const profileImageUrl = profile?.profileImage?.url || '';
    setEditTarget(creator);
    setProfilePreview(profileImageUrl);
    setEditForm({
      displayName: profile?.displayName || creator?.name || '',
      email: userEmail,
      bio: profile?.bio || '',
      website: profile?.website || '',
      country: profile?.country || '',
      state: profile?.state || '',
      city: profile?.city || '',
      zipCode: profile?.zipCode || '',
      gender: profile?.gender || '',
      dob: profile?.dob || '',
      phone: profile?.phone || '',
      profession: profile?.profession || '',
      skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : (profile?.skills || ''),
      portfolioLinks: Array.isArray(profile?.portfolioLinks) ? profile.portfolioLinks : [],
      socialLinks: Array.isArray(profile?.socialLinks) ? profile.socialLinks : [],
      attachments: Array.isArray(profile?.attachments) ? profile.attachments : [],
      totalDownloads: typeof creator?.totalDownloads === 'number' ? creator.totalDownloads : 0,
      followersCount: typeof creator?.followersCount === 'number' ? creator.followersCount : 0,
      followingCount: typeof creator?.followingCount === 'number' ? creator.followingCount : 0,
      profileImage: {
        url: profileImageUrl,
        s3Key: profile?.profileImage?.s3Key || '',
        fileSize: profile?.profileImage?.fileSize || null,
        mimeType: profile?.profileImage?.mimeType || '',
      },
    });
    setEditOpen(true);
  };

  const handleEditChange = (field) => (event) => {
    const value = event.target.value;
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleListChange = (field, index) => (event) => {
    const value = event.target.value;
    setEditForm((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const handleAddList = (field) => {
    setEditForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const handleRemoveList = (field, index) => {
    setEditForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleProfileImagePick = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !editTarget?._id) return;
    setUploading(true);
    try {
      const adminToken = getAdminToken();
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined;
      const targetUserId = editTarget?.userId?._id || editTarget?.userId || null;
      const payload = {
        fileName: file.name,
        fileType: file.type,
        ...(targetUserId ? { targetUserId } : {}),
      };
      const presignRes = await api.post(
        API_ENDPOINTS.GET_PRESIGNED_PROFILE_IMAGE_URL,
        payload,
        { headers }
      );
      const { presignedUrl, s3Url, s3Key } = presignRes.data?.data || {};
      if (!presignedUrl || !s3Url || !s3Key) {
        throw new Error('Invalid presigned response');
      }
      await axios.put(presignedUrl, file, { headers: { 'Content-Type': file.type } });
      setProfilePreview(s3Url);
      setEditForm((prev) => ({
        ...prev,
        profileImage: {
          url: s3Url,
          s3Key,
          fileSize: file.size,
          mimeType: file.type,
        },
      }));
    } catch (err) {
      alert(err?.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setProfilePreview('');
    setEditForm((prev) => ({
      ...prev,
      profileImage: emptyProfileImage,
    }));
  };

  const handleEditSave = async () => {
    if (!editTarget?._id) return;
    setSaving(true);
    try {
      const skills = editForm.skills
        ? editForm.skills.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
      const profile = {
        displayName: editForm.displayName,
        bio: editForm.bio,
        website: editForm.website,
        country: editForm.country,
        state: editForm.state,
        city: editForm.city,
        zipCode: editForm.zipCode,
        gender: editForm.gender,
        dob: editForm.dob,
        phone: editForm.phone,
        profession: editForm.profession,
        skills,
        portfolioLinks: editForm.portfolioLinks.filter(Boolean),
        socialLinks: editForm.socialLinks.filter(Boolean),
        attachments: editForm.attachments.filter(Boolean),
      };
      if (editForm.profileImage?.url) {
        profile.profileImage = { url: editForm.profileImage.url };
      }
      const payload = {
        profile,
        totalDownloads: Number(editForm.totalDownloads || 0),
        followersCount: Number(editForm.followersCount || 0),
        followingCount: Number(editForm.followingCount || 0),
      };
      await api.patch(`/admin/creators/${editTarget._id}`, payload);
      setEditOpen(false);
      setEditTarget(null);
      fetchCreators();
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4">Creators</Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <Paper variant="outlined" sx={{ px: 2, py: 1.2, minWidth: 130 }}>
            <Typography variant="caption" color="text.secondary">Total</Typography>
            <Typography variant="h6">{stats.total}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ px: 2, py: 1.2, minWidth: 130 }}>
            <Typography variant="caption" color="text.secondary">Approved</Typography>
            <Typography variant="h6" color="success.main">{stats.approved}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ px: 2, py: 1.2, minWidth: 130 }}>
            <Typography variant="caption" color="text.secondary">Pending</Typography>
            <Typography variant="h6" color="warning.main">{stats.pending}</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ px: 2, py: 1.2, minWidth: 130 }}>
            <Typography variant="caption" color="text.secondary">Rejected</Typography>
            <Typography variant="h6" color="error.main">{stats.rejected}</Typography>
          </Paper>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            label="Search creators"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Bio</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCreators.map((creator) => (
                <TableRow key={creator._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={creator.profile?.profileImage?.url || creator.profile?.profileImage?.s3Key || ''} alt={creator.profile?.displayName || 'C'} />
                      <Box>
                        <Typography variant="body1">
                          {creator.profile?.displayName || creator.name || creator.userId || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {creator.userId?.email || creator.profile?.email || creator.email || ''}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{creator.profile?.bio || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={(creator.status || 'pending').toUpperCase()}
                      color={getStatusColor(creator.status)}
                      variant={creator.status === 'approved' ? 'filled' : 'outlined'}
                    />
                    {creator.status === 'rejected' && creator.rejectionReason ? ` (${creator.rejectionReason})` : ''}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="info"
                      onClick={() => {
                        setViewTarget(creator);
                        setViewDialogOpen(true);
                      }}
                      title="View details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton color="primary" onClick={() => openEdit(creator)} title="Edit"><Edit /></IconButton>
                    <IconButton color="success" onClick={() => openConfirm('approve', creator)} title="Approve"><CheckCircle /></IconButton>
                    <IconButton color="warning" onClick={() => openConfirm('reject', creator)} title="Reject"><Cancel /></IconButton>
                    <IconButton color="error" onClick={() => openConfirm('delete', creator)} title="Delete"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredCreators.length && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No creators match this filter.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {confirmAction === 'delete' ? 'Delete Creator' : confirmAction === 'reject' ? 'Reject Creator' : 'Approve Creator'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: confirmAction === 'reject' ? 1.5 : 0 }}>
            {confirmAction === 'delete' && `Are you sure you want to delete "${confirmTarget?.profile?.displayName || confirmTarget?.name || 'this creator'}"?`}
            {confirmAction === 'approve' && `Are you sure you want to approve "${confirmTarget?.profile?.displayName || confirmTarget?.name || 'this creator'}"?`}
            {confirmAction === 'reject' && `Please provide a rejection reason for "${confirmTarget?.profile?.displayName || confirmTarget?.name || 'this creator'}".`}
          </Typography>
          {confirmAction === 'reject' && (
            <TextField
              label="Rejection reason"
              fullWidth
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmProceed}
            variant="contained"
            color={confirmAction === 'delete' ? 'error' : confirmAction === 'reject' ? 'warning' : 'success'}
            disabled={confirmAction === 'reject' && !rejectReason.trim()}
          >
            {confirmAction === 'delete' ? 'Delete' : confirmAction === 'reject' ? 'Reject' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Creator</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField
              label="Display Name"
              value={editForm.displayName}
              onChange={handleEditChange('displayName')}
              fullWidth
            />
            <TextField
              label="Email"
              value={editForm.email}
              fullWidth
              disabled
            />
            <TextField
              label="Bio"
              value={editForm.bio}
              onChange={handleEditChange('bio')}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="Website"
              value={editForm.website}
              onChange={handleEditChange('website')}
              fullWidth
            />
            <TextField
              label="Country"
              value={editForm.country}
              onChange={handleEditChange('country')}
              fullWidth
            />
            <TextField
              label="State"
              value={editForm.state}
              onChange={handleEditChange('state')}
              fullWidth
            />
            <TextField
              label="City"
              value={editForm.city}
              onChange={handleEditChange('city')}
              fullWidth
            />
            <TextField
              label="Zip Code"
              value={editForm.zipCode}
              onChange={handleEditChange('zipCode')}
              fullWidth
            />
            <TextField
              select
              label="Gender"
              value={editForm.gender || ''}
              onChange={handleEditChange('gender')}
              fullWidth
            >
              <MenuItem value="">-</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              label="Date of Birth (YYYY-MM-DD)"
              value={editForm.dob}
              onChange={handleEditChange('dob')}
              fullWidth
            />
            <TextField
              label="Phone"
              value={editForm.phone}
              onChange={handleEditChange('phone')}
              fullWidth
            />
            <TextField
              label="Profession"
              value={editForm.profession}
              onChange={handleEditChange('profession')}
              fullWidth
            />
            <TextField
              label="Skills (comma separated)"
              value={editForm.skills}
              onChange={handleEditChange('skills')}
              fullWidth
            />
            <TextField
              label="Total Downloads"
              type="number"
              value={editForm.totalDownloads}
              onChange={handleEditChange('totalDownloads')}
              fullWidth
            />
            <TextField
              label="Followers Count"
              type="number"
              value={editForm.followersCount}
              onChange={handleEditChange('followersCount')}
              fullWidth
            />
            <TextField
              label="Following Count"
              type="number"
              value={editForm.followingCount}
              onChange={handleEditChange('followingCount')}
              fullWidth
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Profile Image</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar src={profilePreview} sx={{ width: 72, height: 72 }} />
            <Box>
              <input id="admin-creator-profile-upload" type="file" accept="image/*" hidden onChange={handleProfileImagePick} />
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                component="label"
                htmlFor="admin-creator-profile-upload"
                disabled={uploading}
                sx={{ mr: 1 }}
              >
                {uploading ? 'Uploading...' : 'Choose Image'}
              </Button>
              <Button
                variant="text"
                color="inherit"
                startIcon={<DeleteOutline />}
                onClick={handleRemoveImage}
                disabled={uploading}
              >
                Remove
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                JPG, PNG, WEBP, GIF and other image files are supported.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Portfolio Links</Typography>
          <Stack spacing={2}>
            {editForm.portfolioLinks.map((link, index) => (
              <Box
                key={`portfolio-${index}`}
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 1.5, alignItems: 'center' }}
              >
                <TextField
                  label="URL"
                  value={link}
                  onChange={handleListChange('portfolioLinks', index)}
                />
                <Button color="error" onClick={() => handleRemoveList('portfolioLinks', index)}>Remove</Button>
              </Box>
            ))}
            <Button variant="outlined" onClick={() => handleAddList('portfolioLinks')}>Add Portfolio Link</Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Social Links</Typography>
          <Stack spacing={2}>
            {editForm.socialLinks.map((link, index) => (
              <Box
                key={`social-${index}`}
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 1.5, alignItems: 'center' }}
              >
                <TextField
                  label="URL"
                  value={link}
                  onChange={handleListChange('socialLinks', index)}
                />
                <Button color="error" onClick={() => handleRemoveList('socialLinks', index)}>Remove</Button>
              </Box>
            ))}
            <Button variant="outlined" onClick={() => handleAddList('socialLinks')}>Add Social Link</Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Attachments</Typography>
          <Stack spacing={2}>
            {editForm.attachments.map((link, index) => (
              <Box
                key={`attachment-${index}`}
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 1.5, alignItems: 'center' }}
              >
                <TextField
                  label="URL"
                  value={link}
                  onChange={handleListChange('attachments', index)}
                />
                <Button color="error" onClick={() => handleRemoveList('attachments', index)}>Remove</Button>
              </Box>
            ))}
            <Button variant="outlined" onClick={() => handleAddList('attachments')}>Add Attachment</Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Creator Details</DialogTitle>
        <DialogContent dividers>
          {viewTarget && (
            <Stack spacing={1.2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={viewTarget.profile?.profileImage?.url || viewTarget.profile?.profileImage?.s3Key || ''}
                  alt={viewTarget.profile?.displayName || 'Creator'}
                  sx={{ width: 52, height: 52 }}
                />
                <Box>
                  <Typography variant="h6">
                    {viewTarget.profile?.displayName || viewTarget.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewTarget.userId?.email || viewTarget.profile?.email || viewTarget.email || '-'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2"><strong>Status:</strong> {(viewTarget.status || 'pending').toUpperCase()}</Typography>
              <Typography variant="body2"><strong>Bio:</strong> {viewTarget.profile?.bio || '-'}</Typography>
              <Typography variant="body2"><strong>Country:</strong> {viewTarget.profile?.country || '-'}</Typography>
              <Typography variant="body2"><strong>City:</strong> {viewTarget.profile?.city || '-'}</Typography>
              <Typography variant="body2"><strong>Portfolio:</strong> {viewTarget.profile?.website || '-'}</Typography>
              <Typography variant="body2"><strong>Created At:</strong> {viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleString() : '-'}</Typography>
              <Typography variant="body2"><strong>Updated At:</strong> {viewTarget.updatedAt ? new Date(viewTarget.updatedAt).toLocaleString() : '-'}</Typography>
              {viewTarget.rejectionReason ? (
                <Typography variant="body2"><strong>Rejection Reason:</strong> {viewTarget.rejectionReason}</Typography>
              ) : null}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
