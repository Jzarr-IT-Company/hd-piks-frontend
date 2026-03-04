import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import ImageIcon from '@mui/icons-material/Image';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import PaidIcon from '@mui/icons-material/Paid';
import { Link, useLocation } from 'react-router-dom';

const menu = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/admin' },
  { label: 'Categories', icon: <CategoryIcon />, to: '/admin/categories' },
  { label: 'Users', icon: <PeopleIcon />, to: '/admin/users' },
  { label: 'Creators', icon: <PeopleIcon />, to: '/admin/creators' },
  { label: 'Images', icon: <ImageIcon />, to: '/admin/images' },
  { label: 'Asset Pricing', icon: <PaidIcon />, to: '/admin/pricing-rules' },
  { label: 'Plans', icon: <PaidIcon />, to: '/admin/subscription-plans' },
  { label: 'Templates', icon: <ViewQuiltIcon />, to: '/admin/templates' },
  { label: 'Blogs', icon: <CategoryIcon />, to: '/admin/blogs' },
  { label: 'Analytics', icon: <BarChartIcon />, to: '/admin/analytics' },
  { label: 'Collections', icon: <CategoryIcon />, to: '/admin/collections' },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <Drawer variant="permanent" sx={{ width: 220, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box' } }}>
      <List>
        {menu.map(item => (
          <ListItem button key={item.label} component={Link} to={item.to} selected={location.pathname === item.to}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
