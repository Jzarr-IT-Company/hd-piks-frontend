import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import { Delete, Edit, UploadFile, DeleteOutline } from '@mui/icons-material';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { getAdminToken } from '../utils/adminAuth';

const emptyProfileImage = {
  url: null,
  s3Key: null,
  fileSize: null,
  mimeType: null,
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    accountStatus: 'active',
    password: '',
    isActive: true,
    city: '',
    country: '',
    gender: '',
    Skills: '',
    PortfolioLink: '',
    download: '',
    followersCount: 0,
    followingCount: 0,
    creatorId: '',
    profileImage: emptyProfileImage,
    SocialMediaLinks: [],
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN_USERS || '/admin/users');
      setUsers(res.data.data || []);
    } catch {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch {
      alert('Delete failed');
    }
  };

  const openEdit = (user) => {
    const links = Array.isArray(user?.SocialMediaLinks)
      ? user.SocialMediaLinks.map((link) => ({
        platform: link?.platform || '',
        url: link?.url || '',
      }))
      : [];
    const profileUrl = user?.profileImage?.url || '';
    setEditTarget(user);
    setProfilePreview(profileUrl);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'user',
      accountStatus: user?.accountStatus || 'active',
      password: '',
      isActive: typeof user?.isActive === 'boolean' ? user.isActive : true,
      city: user?.city || '',
      country: user?.country || '',
      gender: user?.gender || '',
      Skills: user?.Skills || '',
      PortfolioLink: user?.PortfolioLink || '',
      download: user?.download ?? '',
      followersCount: typeof user?.followersCount === 'number' ? user.followersCount : 0,
      followingCount: typeof user?.followingCount === 'number' ? user.followingCount : 0,
      creatorId: user?.creatorId || '',
      profileImage: {
        url: profileUrl || null,
        s3Key: user?.profileImage?.s3Key || null,
        fileSize: user?.profileImage?.fileSize || null,
        mimeType: user?.profileImage?.mimeType || null,
      },
      SocialMediaLinks: links,
    });
    setEditOpen(true);
  };

  const handleEditChange = (field) => (event) => {
    const value = event.target.value;
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (index, field) => (event) => {
    const value = event.target.value;
    setEditForm((prev) => {
      const next = [...prev.SocialMediaLinks];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, SocialMediaLinks: next };
    });
  };

  const handleAddSocial = () => {
    setEditForm((prev) => ({
      ...prev,
      SocialMediaLinks: [...prev.SocialMediaLinks, { platform: '', url: '' }],
    }));
  };

  const handleRemoveSocial = (index) => {
    setEditForm((prev) => ({
      ...prev,
      SocialMediaLinks: prev.SocialMediaLinks.filter((_, i) => i !== index),
    }));
  };

  const handleProfileImagePick = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !editTarget?._id) return;
    setUploading(true);
    try {
      const adminToken = getAdminToken();
      const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined;
      const presignRes = await api.post(
        API_ENDPOINTS.GET_PRESIGNED_PROFILE_IMAGE_URL,
        {
          fileName: file.name,
          fileType: file.type,
          targetUserId: editTarget._id,
        },
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
      const payload = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        accountStatus: editForm.accountStatus,
        isActive: Boolean(editForm.isActive),
        city: editForm.city || null,
        country: editForm.country || null,
        gender: editForm.gender || null,
        Skills: editForm.Skills || null,
        PortfolioLink: editForm.PortfolioLink || null,
        download: editForm.download === '' ? null : Number(editForm.download),
        followersCount: Number(editForm.followersCount || 0),
        followingCount: Number(editForm.followingCount || 0),
        SocialMediaLinks: editForm.SocialMediaLinks || [],
      };
      if (editForm.password && editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }
      if (editForm.profileImage?.url || editForm.profileImage?.s3Key) {
        payload.profileImage = editForm.profileImage;
      } else if (editForm.profileImage?.url === null) {
        payload.profileImage = emptyProfileImage;
      }
      await api.patch(`/admin/users/${editTarget._id}`, payload);
      setEditOpen(false);
      setEditTarget(null);
      fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Users</Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.accountStatus || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => openEdit(user)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(user._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={editForm.name}
              onChange={handleEditChange('name')}
              fullWidth
            />
            <TextField
              label="Email"
              value={editForm.email}
              onChange={handleEditChange('email')}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={editForm.password}
              onChange={handleEditChange('password')}
              fullWidth
              helperText="Leave blank to keep current password."
            />
            <TextField
              select
              label="Role"
              value={editForm.role}
              onChange={handleEditChange('role')}
              fullWidth
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="creator">Creator</MenuItem>
            </TextField>
            <TextField
              select
              label="Account Status"
              value={editForm.accountStatus}
              onChange={handleEditChange('accountStatus')}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="deleted">Deleted</MenuItem>
            </TextField>
            <TextField
              select
              label="Email Verified / Active"
              value={String(editForm.isActive)}
              onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.value === 'true' }))}
              fullWidth
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </TextField>
            <TextField
              label="City"
              value={editForm.city}
              onChange={handleEditChange('city')}
              fullWidth
            />
            <TextField
              label="Country"
              value={editForm.country}
              onChange={handleEditChange('country')}
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
              label="Skills"
              value={editForm.Skills}
              onChange={handleEditChange('Skills')}
              fullWidth
            />
            <TextField
              label="Portfolio Link"
              value={editForm.PortfolioLink}
              onChange={handleEditChange('PortfolioLink')}
              fullWidth
            />
            <TextField
              label="Downloads"
              type="number"
              value={editForm.download}
              onChange={handleEditChange('download')}
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
            <TextField
              label="Linked Creator ID"
              value={editForm.creatorId || ''}
              fullWidth
              disabled
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Profile Image</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar src={profilePreview} sx={{ width: 72, height: 72 }} />
            <Box>
              <input id="admin-user-profile-upload" type="file" accept="image/*" hidden onChange={handleProfileImagePick} />
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                component="label"
                htmlFor="admin-user-profile-upload"
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

          <Typography variant="subtitle1" sx={{ mb: 1 }}>Social Media Links</Typography>
          <Stack spacing={2}>
            {editForm.SocialMediaLinks.map((link, index) => (
              <Box
                key={`${link.platform}-${index}`}
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1.5, alignItems: 'center' }}
              >
                <TextField
                  label="Platform"
                  value={link.platform}
                  onChange={handleSocialChange(index, 'platform')}
                />
                <TextField
                  label="URL"
                  value={link.url}
                  onChange={handleSocialChange(index, 'url')}
                />
                <Button color="error" onClick={() => handleRemoveSocial(index)}>Remove</Button>
              </Box>
            ))}
            <Button variant="outlined" onClick={handleAddSocial}>Add Social Link</Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
