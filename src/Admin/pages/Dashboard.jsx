import React from 'react';
import { Box, Typography } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function AdminDashboard() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1 }}>
        {/* <Topbar /> */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>Welcome to the admin panel.</Typography>
        </Box>
      </Box>
    </Box>
  );
}
