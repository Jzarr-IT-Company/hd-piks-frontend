import React, { useEffect, useMemo, useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import { Delete, CheckCircle, Cancel, Visibility, Search } from '@mui/icons-material';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

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

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN_CREATORS || '/admin/creators');
      setCreators(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch creators');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCreators(); }, []);

  const filteredCreators = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return creators.filter((creator) => {
      const displayName = creator.profile?.displayName || creator.name || '';
      const email = creator.profile?.email || creator.email || '';
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
                          {creator.profile?.email || creator.email || ''}
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
                    {viewTarget.profile?.email || viewTarget.email || '-'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2"><strong>Status:</strong> {(viewTarget.status || 'pending').toUpperCase()}</Typography>
              <Typography variant="body2"><strong>Bio:</strong> {viewTarget.profile?.bio || '-'}</Typography>
              <Typography variant="body2"><strong>Country:</strong> {viewTarget.profile?.country || '-'}</Typography>
              <Typography variant="body2"><strong>City:</strong> {viewTarget.profile?.city || '-'}</Typography>
              <Typography variant="body2"><strong>Portfolio:</strong> {viewTarget.profile?.portfolioLink || '-'}</Typography>
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
