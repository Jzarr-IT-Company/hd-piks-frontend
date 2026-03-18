import React, { useEffect, useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import ImageIcon from '@mui/icons-material/Image';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import PaidIcon from '@mui/icons-material/Paid';
import { Link, useLocation } from 'react-router-dom';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { getAdminSession, setAdminSession } from '../utils/adminAuth';
import { hasAdminPermission } from '../utils/permissions';

export default function Sidebar() {
  const location = useLocation();
  const [session, setSessionState] = useState(() => getAdminSession());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADMIN_ME || '/admin/me');
        const next = res.data?.data || null;
        if (!next) return;
        setAdminSession(next);
        if (mounted) setSessionState(next);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const menu = [
    { label: 'Dashboard', icon: <DashboardIcon />, to: '/admin', requiredPermission: 'dashboard.view' },
    { label: 'Admin Staff', icon: <AdminPanelSettingsIcon />, to: '/admin/staff', requiredPermission: 'staff.manage' },
    { label: 'Categories', icon: <CategoryIcon />, to: '/admin/categories', requiredPermission: 'categories.manage' },
    { label: 'Users', icon: <PeopleIcon />, to: '/admin/users', requiredPermission: 'users.manage' },
    { label: 'Creators', icon: <PeopleIcon />, to: '/admin/creators', requiredPermission: 'creators.manage' },
    { label: 'Images', icon: <ImageIcon />, to: '/admin/images', requiredPermission: 'images.manage' },
    { label: 'Asset Pricing', icon: <PaidIcon />, to: '/admin/pricing-rules', requiredPermission: 'pricing.manage' },
    { label: 'Plans', icon: <PaidIcon />, to: '/admin/subscription-plans', requiredPermission: 'plans.manage' },
    { label: 'Templates', icon: <ViewQuiltIcon />, to: '/admin/templates', requiredPermission: 'templates.manage' },
    { label: 'Blogs', icon: <CategoryIcon />, to: '/admin/blogs', requiredPermission: 'blogs.manage' },
    { label: 'Analytics', icon: <BarChartIcon />, to: '/admin/analytics', requiredPermission: 'analytics.view' },
    { label: 'Collections', icon: <CategoryIcon />, to: '/admin/collections', requiredPermission: 'collections.manage' },
  ];

  const visibleMenu = menu.filter((item) => hasAdminPermission(session, item.requiredPermission));

  return (<Drawer
      variant="permanent"
      sx={{ width: 220, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box' } }}
    >
      <List>
        {visibleMenu.map((item) => (
          <ListItem
            button
            key={item.label}
            component={Link}
            to={item.to}
            selected={location.pathname === item.to}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}






