import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Delete, CheckCircle, Cancel } from '@mui/icons-material';
import api from '../../Services/api';


export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

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
    } catch (err) {
      setError('Failed to fetch images or creators');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);


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
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/admin/images/${id}`);
      fetchData();
    } catch {
      alert('Delete failed');
    }
  };

  // Map creatorId to displayName
  const getCreatorName = (creatorId) => {
    const creator = creators.find(c => c._id === creatorId);
    return creator?.profile?.displayName || creator?.name || creatorId || '-';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Images</Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Preview</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {images.map((img) => (
                <TableRow key={img._id}>
                  <TableCell>
                    <Avatar variant="rounded" src={img.imageUrl || img.url || img.thumbnailUrl || ''} alt={img.title || 'Image'} />
                  </TableCell>
                  <TableCell>{img.title || img.name || img._id}</TableCell>
                  <TableCell>
                    {/* Prefer status field if present, else fallback */}
                    {img.status
                      ? (img.status.charAt(0).toUpperCase() + img.status.slice(1))
                      : img.approved
                        ? 'Approved'
                        : img.rejected
                          ? 'Rejected'
                          : 'Pending'}
                    {(img.status === 'rejected' || img.rejected) && img.rejectionReason ? ` (${img.rejectionReason})` : ''}
                  </TableCell>
                  <TableCell>
                    {getCreatorName(img.creatorId)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="success" onClick={() => handleStatus(img._id, 'approved')} title="Approve"><CheckCircle /></IconButton>
                    <IconButton color="warning" onClick={() => handleRejectClick(img._id)} title="Reject"><Cancel /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(img._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            onChange={e => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} variant="contained" disabled={!rejectReason.trim()}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
