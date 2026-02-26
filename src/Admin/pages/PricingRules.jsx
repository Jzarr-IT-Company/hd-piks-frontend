import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

const EMPTY_FORM = {
  categoryId: '',
  subcategoryId: '',
  scope: 'default',
  format: '',
  priceUsd: '',
  isActive: true,
};

const toId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.$oid) return String(value.$oid);
    if (value.id) return String(value.id);
  }
  return String(value);
};

const formatUsd = (priceCents) => {
  const cents = Number(priceCents);
  if (!Number.isFinite(cents) || cents <= 0) return '-';
  return `$${(cents / 100).toFixed(2)}`;
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const toErrorMessage = (error, fallback = 'Request failed') => {
  const body = error?.response?.data;
  if (Array.isArray(body?.errors) && body.errors.length) return String(body.errors[0]);
  if (body?.message) return String(body.message);
  return fallback;
};

export default function PricingRulesPage() {
  const [categories, setCategories] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const categoryNameMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      map.set(toId(cat._id), cat.name || 'Unnamed');
    });
    return map;
  }, [categories]);

  const topLevelCategories = useMemo(
    () => categories.filter((cat) => !toId(cat.parent)),
    [categories]
  );

  const subcategoryOptions = useMemo(() => {
    if (!form.categoryId) return [];
    return categories.filter((cat) => toId(cat.parent) === form.categoryId);
  }, [categories, form.categoryId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rulesRes, categoriesRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN_PRICING_RULES),
        api.get(API_ENDPOINTS.ADMIN_CATEGORIES),
      ]);
      setRules(Array.isArray(rulesRes?.data?.data) ? rulesRes.data.data : []);
      setCategories(Array.isArray(categoriesRes?.data?.data) ? categoriesRes.data.data : []);
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to load pricing rules'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditRule(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditRule(rule);
    setForm({
      categoryId: toId(rule?.categoryId),
      subcategoryId: toId(rule?.subcategoryId),
      scope: rule?.isDefault ? 'default' : 'format',
      format: rule?.isDefault ? '' : String(rule?.format || ''),
      priceUsd: Number.isFinite(Number(rule?.priceCents))
        ? (Number(rule.priceCents) / 100).toFixed(2)
        : '',
      isActive: Boolean(rule?.isActive),
    });
    setFormError('');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setOpen(false);
    setEditRule(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleSave = async () => {
    setFormError('');

    if (!form.categoryId) {
      setFormError('Category is required.');
      return;
    }
    if (!form.subcategoryId) {
      setFormError('Subcategory is required.');
      return;
    }
    const formatTokens = form.scope === 'format'
      ? [...new Set(
        String(form.format || '')
          .split(',')
          .map((token) => token.trim())
          .filter(Boolean)
      )]
      : [];

    if (form.scope === 'format' && !formatTokens.length) {
      setFormError('Format is required for format-specific pricing.');
      return;
    }
    if (editRule?._id && formatTokens.length > 1) {
      setFormError('Edit supports one format only. Delete and create separate rules for multiple formats.');
      return;
    }

    const usd = Number(form.priceUsd);
    if (!Number.isFinite(usd) || usd <= 0) {
      setFormError('Price must be a positive USD amount.');
      return;
    }
    const priceCents = Math.round(usd * 100);
    if (!Number.isInteger(priceCents) || priceCents <= 0) {
      setFormError('Price conversion to cents failed. Please check the value.');
      return;
    }

    const payload = {
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId,
      isDefault: form.scope === 'default',
      format: form.scope === 'default' ? null : formatTokens[0],
      priceCents,
      currency: 'USD',
      isActive: Boolean(form.isActive),
    };

    setSaving(true);
    try {
      if (editRule?._id) {
        await api.patch(API_ENDPOINTS.ADMIN_PRICING_RULE(editRule._id), payload);
      } else {
        if (form.scope === 'format' && formatTokens.length > 1) {
          const failures = [];
          for (const token of formatTokens) {
            try {
              await api.post(API_ENDPOINTS.ADMIN_PRICING_RULES, {
                ...payload,
                format: token,
              });
            } catch (err) {
              failures.push({ token, message: toErrorMessage(err, 'Failed to create rule') });
            }
          }
          if (failures.length) {
            const firstFailure = failures[0];
            setFormError(
              `Some rules failed. Example: ${firstFailure.token} -> ${firstFailure.message}`
            );
            await loadData();
            return;
          }
        } else {
          await api.post(API_ENDPOINTS.ADMIN_PRICING_RULES, payload);
        }
      }
      handleCloseDialog();
      await loadData();
    } catch (err) {
      setFormError(toErrorMessage(err, 'Failed to save pricing rule'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!ruleId) return;
    if (!window.confirm('Delete this pricing rule?')) return;
    try {
      await api.delete(API_ENDPOINTS.ADMIN_PRICING_RULE(ruleId));
      await loadData();
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to delete pricing rule'));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4">Pricing Rules</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure premium price by category, subcategory, and optional format.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Add Rule
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.length ? (
                rules.map((rule) => (
                  <TableRow key={rule._id}>
                    <TableCell>{categoryNameMap.get(toId(rule.categoryId)) || toId(rule.categoryId) || '-'}</TableCell>
                    <TableCell>{categoryNameMap.get(toId(rule.subcategoryId)) || toId(rule.subcategoryId) || '-'}</TableCell>
                    <TableCell>
                      {rule.isDefault ? 'Default (all formats)' : `Format: ${String(rule.format || '').toUpperCase()}`}
                    </TableCell>
                    <TableCell>{formatUsd(rule.priceCents)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={rule.isActive ? 'Active' : 'Inactive'}
                        color={rule.isActive ? 'success' : 'default'}
                        variant={rule.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(rule.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenEdit(rule)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(rule._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No pricing rules found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="pricing-category-label">Category</InputLabel>
            <Select
              labelId="pricing-category-label"
              value={form.categoryId}
              label="Category"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  categoryId: event.target.value,
                  subcategoryId: '',
                }))
              }
            >
              {topLevelCategories.map((cat) => (
                <MenuItem key={cat._id} value={toId(cat._id)}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }} disabled={!form.categoryId}>
            <InputLabel id="pricing-subcategory-label">Subcategory</InputLabel>
            <Select
              labelId="pricing-subcategory-label"
              value={form.subcategoryId}
              label="Subcategory"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  subcategoryId: event.target.value,
                }))
              }
            >
              {subcategoryOptions.map((cat) => (
                <MenuItem key={cat._id} value={toId(cat._id)}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="pricing-scope-label">Rule Scope</InputLabel>
            <Select
              labelId="pricing-scope-label"
              value={form.scope}
              label="Rule Scope"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  scope: event.target.value,
                  format: event.target.value === 'default' ? '' : prev.format,
                }))
              }
            >
              <MenuItem value="default">Default (all formats)</MenuItem>
              <MenuItem value="format">Specific format</MenuItem>
            </Select>
          </FormControl>

          {form.scope === 'format' && (
            <TextField
              margin="dense"
              label="Format"
              fullWidth
              value={form.format}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  format: event.target.value,
                }))
              }
              placeholder="jpeg, png, webp, mp4"
              helperText="Create mode accepts comma-separated formats and creates one rule per format."
            />
          )}

          <TextField
            margin="dense"
            label="Price (USD)"
            fullWidth
            type="number"
            inputProps={{ min: 0.01, step: 0.01 }}
            value={form.priceUsd}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                priceUsd: event.target.value,
              }))
            }
            placeholder="2.00"
          />

          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Switch
                checked={Boolean(form.isActive)}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: event.target.checked,
                  }))
                }
              />
            }
            label="Rule active"
          />

          {formError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
