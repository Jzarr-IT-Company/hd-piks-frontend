import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Avatar } from '@mui/material';
import { Delete, CheckCircle, Cancel } from '@mui/icons-material';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this creator?')) return;
    try {
      await api.delete(`/admin/creators/${id}`);
      fetchCreators();
    } catch {
      alert('Delete failed');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/admin/creators/${id}/status`, { status });
      fetchCreators();
    } catch {
      alert('Status update failed');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Creators</Typography>
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
              {creators.map((creator) => (
                <TableRow key={creator._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={creator.profile?.profileImage?.url || creator.profile?.profileImage?.s3Key || ''} alt={creator.profile?.displayName || 'C'} />
                      {creator.profile?.displayName || creator.name || creator.userId || 'Unknown'}
                    </Box>
                  </TableCell>
                  <TableCell>{creator.profile?.bio || ''}</TableCell>
                  <TableCell>{creator.status}</TableCell>
                  <TableCell align="right">
                    <IconButton color="success" onClick={() => handleStatus(creator._id, 'approved')} title="Approve"><CheckCircle /></IconButton>
                    <IconButton color="warning" onClick={() => handleStatus(creator._id, 'rejected')} title="Reject"><Cancel /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(creator._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {error && <Typography color="error" variant="body2">{error}</Typography>}
    </Box>
  );
}
