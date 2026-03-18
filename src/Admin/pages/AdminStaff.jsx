import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  IconButton,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

const LEVELS = [
  { value: 'manager', label: 'manager' },
  { value: 'super_admin', label: 'super admin' },
];

const ACCOUNT_STATUSES = ['active', 'suspended', 'deleted'];

const PERMISSION_OPTIONS = [
  'dashboard.view',
  'users.manage',
  'creators.manage',
  'categories.manage',
  'images.manage',
  'pricing.manage',
  'plans.manage',
  'templates.manage',
  'collections.manage',
  'blogs.manage',
  'analytics.view',
];

const normalizeManagerPermissions = (permissions = []) => {
  const cleaned = Array.isArray(permissions) ? permissions : [];
  const next = new Set(['dashboard.view', ...cleaned]);
  // Managers are not allowed to grant staff.manage; backend enforces this too.
  next.delete('staff.manage');
  return [...next];
};

export default function AdminStaffPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState('active');
  const [enabled, setEnabled] = useState(true);
  const [level, setLevel] = useState('manager');
  const [permissions, setPermissions] = useState(['dashboard.view']);

  const canEditPermissions = level === 'manager';

  const permissionsValue = useMemo(() => {
    if (!canEditPermissions) return [];
    return normalizeManagerPermissions(permissions);
  }, [permissions, canEditPermissions]);

  const fetchStaff = async () => {
    setLoading(true);
    setPageError('');
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN_STAFF || '/admin/staff');
      setRows(res.data?.data || []);
    } catch (e) {
      setPageError(e.response?.data?.message || 'Failed to fetch admin staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setEmail('');
    setPassword('');
    setAccountStatus('active');
    setEnabled(true);
    setLevel('manager');
    setPermissions(['dashboard.view']);
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (row) => {
    resetForm();
    setEditing(row);
    setName(row?.name || '');
    setEmail(row?.email || '');
    setPassword('');
    setAccountStatus(row?.accountStatus || 'active');
    setEnabled(Boolean(row?.adminPanelAccess?.enabled));
    setLevel(row?.adminPanelAccess?.level || 'manager');
    setPermissions(
      Array.isArray(row?.adminPanelAccess?.permissions)
        ? row.adminPanelAccess.permissions
        : ['dashboard.view']
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSaving(false);
    setFormError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name,
        email,
        ...(password.trim() ? { password } : {}),
        accountStatus,
        enabled,
        level,
        ...(level === 'manager' ? { permissions: permissionsValue } : {}),
      };

      if (editing?._id) {
        const url = API_ENDPOINTS.ADMIN_STAFF_MEMBER
          ? API_ENDPOINTS.ADMIN_STAFF_MEMBER(editing._id)
          : `/admin/staff/${editing._id}`;
        await api.patch(url, payload);
      } else {
        if (!password.trim()) {
          setFormError('Password is required for new staff');
          setSaving(false);
          return;
        }
        await api.post(API_ENDPOINTS.ADMIN_STAFF || '/admin/staff', payload);
      }

      setOpen(false);
      await fetchStaff();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const renderLevelChip = (row) => {
    const raw = row?.adminPanelAccess?.level || '';
    const label = raw === 'super_admin' ? 'super admin' : 'manager';
    const color = raw === 'super_admin' ? 'secondary' : 'primary';
    return <Chip size="small" label={label} color={color} variant="outlined" />;
  };

  const renderAccessChip = (row) => {
    const isEnabled = Boolean(row?.adminPanelAccess?.enabled);
    return (
      <Chip
        size="small"
        label={isEnabled ? 'Enabled' : 'Disabled'}
        color={isEnabled ? 'success' : 'default'}
      />
    );
  };

  const renderPermissionSummary = (row) => {
    const rawLevel = row?.adminPanelAccess?.level || '';
    if (rawLevel === 'super_admin') return 'All permissions';
    const perms = Array.isArray(row?.adminPanelAccess?.permissions)
      ? row.adminPanelAccess.permissions
      : [];
    return `${perms.length} assigned`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4">Admin Staff</Typography>
          <Typography variant="body2" color="text.secondary">
            Create sub-admin and manager accounts, then assign panel permissions.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Add Staff
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Panel Access</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{renderLevelChip(row)}</TableCell>
                  <TableCell>{renderAccessChip(row)}</TableCell>
                  <TableCell>{renderPermissionSummary(row)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenEdit(row)}>
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      No staff accounts found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pageError && (
        <Typography sx={{ mt: 2 }} color="error" variant="body2">
          {pageError}
        </Typography>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label={editing ? 'New Password (optional)' : 'Password'}
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={
              editing
                ? 'Leave blank to keep current password.'
                : '8+ chars with upper/lower/number/special.'
            }
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="admin-staff-level-label">Level</InputLabel>
              <Select
                labelId="admin-staff-level-label"
                label="Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {LEVELS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="admin-staff-status-label">Account Status</InputLabel>
              <Select
                labelId="admin-staff-status-label"
                label="Account Status"
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value)}
              >
                {ACCOUNT_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
            label="Panel Access Enabled"
          />

          <FormControl fullWidth sx={{ mt: 2 }} disabled={!canEditPermissions}>
            <InputLabel id="admin-staff-perms-label">Permissions</InputLabel>
            <Select
              labelId="admin-staff-perms-label"
              multiple
              value={permissionsValue}
              onChange={(e) => setPermissions(e.target.value)}
              input={<OutlinedInput label="Permissions" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {PERMISSION_OPTIONS.map((perm) => (
                <MenuItem key={perm} value={perm}>
                  <Checkbox checked={permissionsValue.indexOf(perm) > -1} />
                  <ListItemText primary={perm} />
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Managers always get dashboard access. Super admins automatically get all permissions.
            </Typography>
          </FormControl>

          {formError && (
            <Typography sx={{ mt: 2 }} color="error" variant="body2">
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
