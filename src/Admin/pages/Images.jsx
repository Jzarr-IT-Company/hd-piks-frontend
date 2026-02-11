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
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  MenuItem,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { Delete, CheckCircle, Cancel, Visibility, Search as SearchIcon } from '@mui/icons-material';
import api from '../../Services/api';

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'delete'
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploaderFilter, setUploaderFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch images and creators
  const fetchData = async () => {
    setLoading(true);
    try {
      const [imgRes, creatorRes] = await Promise.all([
        api.get('/admin/images'),
        api.get('/admin/creators'),
      ]);
      setImages(imgRes.data.data || []);
      setCreators(creatorRes.data.data || []);
    } catch {
      setError('Failed to fetch images or creators');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const nameOf = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') return field.name || '';
    return String(field);
  };

  const getStatusLabel = (img) => {
    const status = String(img?.status || '').toLowerCase();
    if (status === 'approved' || img?.approved === true) return 'Approved';
    if (status === 'rejected' || img?.rejected === true) return 'Rejected';
    return 'Pending';
  };

  const getStatusColor = (img) => {
    const status = getStatusLabel(img);
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'warning';
    return 'default';
  };

  const creatorMap = useMemo(() => {
    const map = {};
    creators.forEach((c) => {
      map[String(c._id)] = c;
    });
    return map;
  }, [creators]);

  const handleStatus = async (id, status, reason = null) => {
    try {
      await api.patch(`/admin/images/${id}/status`, { status, reason });
      fetchData();
    } catch {
      alert('Status update failed');
    }
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    await handleStatus(rejectingId, 'rejected', rejectReason);
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectReason('');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/images/${id}`);
      fetchData();
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await api.delete('/fileObjectDelete', { data: { id } });
          fetchData();
          return;
        } catch {
          alert('Delete failed');
          return;
        }
      }
      alert('Delete failed');
    }
  };

  const handleApproveClick = (img) => {
    setConfirmAction('approve');
    setConfirmTarget(img);
    setConfirmDialogOpen(true);
  };

  const handleDeleteClick = (img) => {
    setConfirmAction('delete');
    setConfirmTarget(img);
    setConfirmDialogOpen(true);
  };

  const handleConfirmProceed = async () => {
    if (!confirmTarget?._id) return;
    if (confirmAction === 'approve') {
      await handleStatus(confirmTarget._id, 'approved');
    } else if (confirmAction === 'delete') {
      await handleDelete(confirmTarget._id);
    }
    setConfirmDialogOpen(false);
    setConfirmAction(null);
    setConfirmTarget(null);
  };

  const getCreatorName = (creatorId) => {
    if (!creatorId) return '-';
    const normalizedId = typeof creatorId === 'object'
      ? String(creatorId._id || creatorId.$oid || '')
      : String(creatorId);
    const creator = creatorMap[normalizedId] || creators.find((c) => String(c._id) === normalizedId);
    return creator?.profile?.displayName || creator?.name || normalizedId || '-';
  };

  const getFileQuality = (img) => {
    const w = img?.fileMetadata?.dimensions?.width;
    const h = img?.fileMetadata?.dimensions?.height;
    if (w && h) return `${w} x ${h}`;
    return '-';
  };

  const getFileSize = (img) => {
    return img?.fileMetadata?.fileSizeFormatted || img?.imagesize || '-';
  };

  const getFileType = (img) => {
    return img?.fileMetadata?.mimeType || img?.imagetype || '-';
  };

  const isVideo = (img) => {
    const type = getFileType(img);
    return type.startsWith('video/');
  };

  const uploaderOptions = useMemo(() => {
    return Array.from(
      new Set(
        images
          .map((img) => getCreatorName(img.creatorId))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [images, creatorMap]);

  const typeOptions = useMemo(() => {
    return Array.from(
      new Set(
        images
          .map((img) => getFileType(img))
          .filter((type) => type && type !== '-')
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [images]);

  const statusCounts = useMemo(() => {
    const counts = { total: images.length, approved: 0, pending: 0, rejected: 0 };
    images.forEach((img) => {
      const status = getStatusLabel(img);
      if (status === 'Approved') counts.approved += 1;
      else if (status === 'Rejected') counts.rejected += 1;
      else counts.pending += 1;
    });
    return counts;
  }, [images]);

  const filteredImages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return images.filter((img) => {
      const status = getStatusLabel(img);
      const uploader = getCreatorName(img.creatorId);
      const type = getFileType(img);
      const title = (img.title || img.name || img._id || '').toLowerCase();

      const matchesQuery = !q
        || title.includes(q)
        || uploader.toLowerCase().includes(q)
        || type.toLowerCase().includes(q)
        || status.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter;
      const matchesUploader = uploaderFilter === 'all' || uploader === uploaderFilter;
      const matchesType = typeFilter === 'all' || type === typeFilter;

      return matchesQuery && matchesStatus && matchesUploader && matchesType;
    });
  }, [images, query, statusFilter, uploaderFilter, typeFilter, creatorMap]);

  useEffect(() => {
    setPage(0);
  }, [query, statusFilter, uploaderFilter, typeFilter]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredImages.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [filteredImages.length, page, rowsPerPage]);

  const pagedImages = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredImages.slice(start, start + rowsPerPage);
  }, [filteredImages, page, rowsPerPage]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Images</Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="h6">{statusCounts.total}</Typography>
        </Paper>
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Approved</Typography>
          <Typography variant="h6" color="success.main">{statusCounts.approved}</Typography>
        </Paper>
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Pending</Typography>
          <Typography variant="h6">{statusCounts.pending}</Typography>
        </Paper>
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Rejected</Typography>
          <Typography variant="h6" color="warning.main">{statusCounts.rejected}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, gap: 1.5 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, uploader, type or status"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Uploader"
            value={uploaderFilter}
            onChange={(e) => setUploaderFilter(e.target.value)}
          >
            <MenuItem value="all">All uploaders</MenuItem>
            {uploaderOptions.map((uploader) => (
              <MenuItem key={uploader} value={uploader}>{uploader}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All types</MenuItem>
            {typeOptions.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Preview</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedImages.map((img) => (
                <TableRow key={img._id}>
                  <TableCell>
                    <Avatar variant="rounded" src={img.imageUrl || img.url || img.thumbnailUrl || ''} alt={img.title || 'Image'} />
                  </TableCell>
                  <TableCell>{img.title || img.name || img._id}</TableCell>
                  <TableCell>{getFileType(img)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusLabel(img)}
                      color={getStatusColor(img)}
                      variant={img.approved ? 'filled' : 'outlined'}
                    />
                    {img.rejected && img.rejectionReason ? ` (${img.rejectionReason})` : ''}
                  </TableCell>
                  <TableCell>
                    {getCreatorName(img.creatorId)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="info" onClick={() => { setViewTarget(img); setViewDialogOpen(true); }} title="View details">
                      <Visibility />
                    </IconButton>
                    <IconButton color="success" onClick={() => handleApproveClick(img)} title="Approve"><CheckCircle /></IconButton>
                    <IconButton color="warning" onClick={() => handleRejectClick(img._id)} title="Reject"><Cancel /></IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(img)} title="Delete"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {pagedImages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No assets match the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredImages.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}

      {error && <Typography color="error" variant="body2">{error}</Typography>}

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Rejection Reason</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} variant="contained" disabled={!rejectReason.trim()}>Reject</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Approve/Delete Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          {confirmAction === 'delete' ? 'Confirm Delete Asset' : 'Confirm Approve Asset'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {confirmAction === 'delete'
              ? `Are you sure you want to delete "${confirmTarget?.title || 'this asset'}"? This action cannot be undone.`
              : `Approve "${confirmTarget?.title || 'this asset'}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmProceed}
            variant="contained"
            color={confirmAction === 'delete' ? 'error' : 'success'}
          >
            {confirmAction === 'delete' ? 'Delete' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Asset Details</DialogTitle>
        <DialogContent dividers>
          {viewTarget && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 2 }}>
              <Box>
                {isVideo(viewTarget) ? (
                  <video
                    src={viewTarget.imageUrl}
                    controls
                    style={{ width: '100%', borderRadius: 8, background: '#000' }}
                  />
                ) : (
                  <img
                    src={viewTarget.imageUrl}
                    alt={viewTarget.title || 'asset'}
                    style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                  />
                )}
              </Box>
              <Stack spacing={1.1}>
                <Typography variant="h6">{viewTarget.title || 'Untitled'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewTarget.description || 'No description'}
                </Typography>
                <Typography variant="body2"><strong>Uploader:</strong> {getCreatorName(viewTarget.creatorId)}</Typography>
                <Typography variant="body2"><strong>Type:</strong> {getFileType(viewTarget)}</Typography>
                <Typography variant="body2"><strong>Quality:</strong> {getFileQuality(viewTarget)}</Typography>
                <Typography variant="body2"><strong>Size:</strong> {getFileSize(viewTarget)}</Typography>
                <Typography variant="body2">
                  <strong>Category:</strong>{' '}
                  {[nameOf(viewTarget.category), nameOf(viewTarget.subcategory), nameOf(viewTarget.subsubcategory)]
                    .filter(Boolean)
                    .join(' / ') || '-'}
                </Typography>
                <Typography variant="body2"><strong>Plan:</strong> {viewTarget.freePremium || '-'}</Typography>
                <Typography variant="body2"><strong>Approved:</strong> {viewTarget.approved ? 'Yes' : 'No'}</Typography>
                <Typography variant="body2"><strong>Rejected:</strong> {viewTarget.rejected ? 'Yes' : 'No'}</Typography>
                <Typography variant="body2">
                  <strong>Keywords:</strong> {Array.isArray(viewTarget.keywords) ? viewTarget.keywords.join(', ') || '-' : '-'}
                </Typography>
                <Typography variant="body2"><strong>Uploaded At:</strong> {viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleString() : '-'}</Typography>
                <Typography variant="body2"><strong>Updated At:</strong> {viewTarget.updatedAt ? new Date(viewTarget.updatedAt).toLocaleString() : '-'}</Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
