import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { getAdminSession, removeAdminAuth, setAdminSession } from '../utils/adminAuth';

const formatAdminLevel = (level) => {
  if (level === 'super_admin') return 'Super Admin';
  if (level === 'manager') return 'Manager';
  return '';
};

export default function Topbar() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(() => getAdminSession());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADMIN_ME || '/admin/me');
        const session = res.data?.data || null;
        if (!session) return;
        setAdminSession(session);
        if (mounted) setAdmin(session);
      } catch {
        // ignore, admin guard + api interceptor handle redirects
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    removeAdminAuth();
    navigate('/admin/login');
  };

  const name = admin?.name || '';
  const level = formatAdminLevel(admin?.adminPanelAccess?.level);
  const title = name ? `Admin Panel - ${name}${level ? ` (${level})` : ''}` : 'Admin Panel';

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{title}</Typography>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}
