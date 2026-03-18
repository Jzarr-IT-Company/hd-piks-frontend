import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { getAdminSession, setAdminSession } from '../utils/adminAuth';
import { hasAdminPermission } from '../utils/permissions';

export default function PermissionRoute({ permission, children }) {
  const location = useLocation();
  const [session, setSessionState] = useState(() => getAdminSession());
  const [loading, setLoading] = useState(!session);

  useEffect(() => {
    let mounted = true;
    if (session) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADMIN_ME || '/admin/me');
        const next = res.data?.data || null;
        if (!next) return;
        setAdminSession(next);
        if (mounted) setSessionState(next);
      } catch {
        // ignore: api interceptor handles redirect on auth failure
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CircularProgress />
      </div>
    );
  }

  const allowed = hasAdminPermission(session, permission);
  if (!allowed) {
    return <Navigate to="/admin" replace state={{ from: location.pathname, reason: 'permission-denied' }} />;
  }

  return children;
}
