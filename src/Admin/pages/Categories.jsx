import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { Edit, Delete, Add, ExpandMore, ChevronRight } from '@mui/icons-material';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

export default function CategoriesPage() {
  const FILE_SIZE_OPTIONS = [
    { label: '0 KB', value: 0 },
    { label: '100 KB', value: 102400 },
    { label: '250 KB', value: 256000 },
    { label: '500 KB', value: 512000 },
    { label: '1 MB', value: 1048576 },
    { label: '2 MB', value: 2097152 },
    { label: '5 MB', value: 5242880 },
    { label: '10 MB', value: 10485760 },
    { label: '15 MB', value: 15728640 },
  ];
  const ZIP_SIZE_OPTIONS = [
    { label: '0 KB', value: 0 },
    { label: '1 MB', value: 1048576 },
    { label: '10 MB', value: 10485760 },
    { label: '100 MB', value: 104857600 },
    { label: '500 MB', value: 524288000 },
  ];
  const DEFAULT_ALLOWED_MIME_TYPES = 'image/jpeg, image/png, image/webp, image/gif';
  const DEFAULT_ZIP_ALLOWED_MIME_TYPES = 'application/zip, application/x-zip-compressed, multipart/x-zip';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [parent, setParent] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const [allowedMimeTypesInput, setAllowedMimeTypesInput] = useState('');
  const [minFileSizeBytes, setMinFileSizeBytes] = useState('');
  const [maxFileSizeBytes, setMaxFileSizeBytes] = useState('');
  const [zipMode, setZipMode] = useState('');
  const [zipAllowedMimeTypesInput, setZipAllowedMimeTypesInput] = useState('');
  const [zipMinFileSizeBytes, setZipMinFileSizeBytes] = useState('');
  const [zipMaxFileSizeBytes, setZipMaxFileSizeBytes] = useState('');
  const [seoMetaTagsHtml, setSeoMetaTagsHtml] = useState('');
  const [seoSchemaScriptHtml, setSeoSchemaScriptHtml] = useState('');

  const parseMimeTypesInput = (raw = '') =>
    [...new Set(
      raw
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )];
  const normalizeCategoryName = (value = '') =>
    String(value).trim().replace(/\s+/g, ' ').toLowerCase();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN_CATEGORIES);
      setCategories(res.data.data || []);
    } catch {
      setError('Failed to fetch categories');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpen = (cat = null) => {
    setEditCategory(cat);
    setName(cat ? cat.name : '');
    setParent(cat && cat.parent ? cat.parent : '');
    setAllowedMimeTypesInput(
      cat
        ? (Array.isArray(cat.allowedMimeTypes) ? cat.allowedMimeTypes.join(', ') : '')
        : DEFAULT_ALLOWED_MIME_TYPES
    );
    setMinFileSizeBytes(
      cat?.minFileSizeBytes !== null && cat?.minFileSizeBytes !== undefined
        ? String(cat.minFileSizeBytes)
        : ''
    );
    setMaxFileSizeBytes(
      cat?.maxFileSizeBytes !== null && cat?.maxFileSizeBytes !== undefined
        ? String(cat.maxFileSizeBytes)
        : ''
    );
    setZipMode(cat?.zipMode || '');
    setZipAllowedMimeTypesInput(
      cat
        ? (Array.isArray(cat.zipAllowedMimeTypes) ? cat.zipAllowedMimeTypes.join(', ') : '')
        : DEFAULT_ZIP_ALLOWED_MIME_TYPES
    );
    setZipMinFileSizeBytes(
      cat?.zipMinFileSizeBytes !== null && cat?.zipMinFileSizeBytes !== undefined
        ? String(cat.zipMinFileSizeBytes)
        : ''
    );
    setZipMaxFileSizeBytes(
      cat?.zipMaxFileSizeBytes !== null && cat?.zipMaxFileSizeBytes !== undefined
        ? String(cat.zipMaxFileSizeBytes)
        : ''
    );
    setSeoMetaTagsHtml(cat?.seo?.metaTagsHtml || '');
    setSeoSchemaScriptHtml(cat?.seo?.schemaScriptHtml || '');
    setParentSearch('');
    setConfirmExitOpen(false);
    setOpen(true);
    setError('');
  };
  const handleClose = () => {
    setConfirmExitOpen(false);
    setOpen(false);
    setEditCategory(null);
    setName('');
    setParent('');
    setParentSearch('');
    setAllowedMimeTypesInput('');
    setMinFileSizeBytes('');
    setMaxFileSizeBytes('');
    setZipMode('');
    setZipAllowedMimeTypesInput('');
    setZipMinFileSizeBytes('');
    setZipMaxFileSizeBytes('');
    setSeoMetaTagsHtml('');
    setSeoSchemaScriptHtml('');
    setError('');
  };
  const handleModalAttemptClose = (_event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      setConfirmExitOpen(true);
      return;
    }
    handleClose();
  };
  const handleCancelExitConfirmation = () => {
    setConfirmExitOpen(false);
  };
  const handleConfirmExit = () => {
    handleClose();
  };

  const handleSave = async (quickAdd = false) => {
    if (!name.trim()) { setError('Name required'); return; }
    const normalizedTargetName = normalizeCategoryName(name);
    const duplicateInSameParent = categories.some((categoryItem) => {
      const sameParent = String(categoryItem?.parent || '') === String(parent || '');
      const sameName = normalizeCategoryName(categoryItem?.name || '') === normalizedTargetName;
      const isDifferentCategory = !editCategory || String(categoryItem?._id || '') !== String(editCategory?._id || '');
      return sameParent && sameName && isDifferentCategory;
    });
    if (duplicateInSameParent) {
      setError('A category with this name already exists under the selected parent');
      return;
    }
    const parsedMin = minFileSizeBytes === '' ? null : Number(minFileSizeBytes);
    const parsedMax = maxFileSizeBytes === '' ? null : Number(maxFileSizeBytes);
    const parsedZipMin = zipMinFileSizeBytes === '' ? null : Number(zipMinFileSizeBytes);
    const parsedZipMax = zipMaxFileSizeBytes === '' ? null : Number(zipMaxFileSizeBytes);
    if ((parsedMin !== null && (!Number.isFinite(parsedMin) || parsedMin < 0)) ||
      (parsedMax !== null && (!Number.isFinite(parsedMax) || parsedMax < 0))) {
      setError('Min/Max file size must be positive numbers or empty');
      return;
    }
    if ((parsedZipMin !== null && (!Number.isFinite(parsedZipMin) || parsedZipMin < 0)) ||
      (parsedZipMax !== null && (!Number.isFinite(parsedZipMax) || parsedZipMax < 0))) {
      setError('ZIP Min/Max file size must be positive numbers or empty');
      return;
    }
    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      setError('Minimum file size cannot be greater than maximum file size');
      return;
    }
    if (parsedZipMin !== null && parsedZipMax !== null && parsedZipMin > parsedZipMax) {
      setError('ZIP minimum file size cannot be greater than ZIP maximum file size');
      return;
    }
    if (zipMode && !['hidden', 'optional', 'required'].includes(zipMode)) {
      setError('Invalid ZIP mode selected');
      return;
    }

    const payload = {
      name: name.trim(),
      parent: parent || null,
      allowedMimeTypes: parseMimeTypesInput(allowedMimeTypesInput),
      minFileSizeBytes: parsedMin,
      maxFileSizeBytes: parsedMax,
      zipMode: zipMode || null,
      zipAllowedMimeTypes: parseMimeTypesInput(zipAllowedMimeTypesInput),
      zipMinFileSizeBytes: parsedZipMin,
      zipMaxFileSizeBytes: parsedZipMax,
      seo: {
        metaTagsHtml: seoMetaTagsHtml,
        schemaScriptHtml: seoSchemaScriptHtml,
      },
    };
    try {
      let newCategory = null;
      if (editCategory) {
        await api.patch(
          API_ENDPOINTS.ADMIN_CATEGORY(editCategory._id),
          payload
        );
        handleClose();
        fetchCategories();
      } else {
        const res = await api.post(
          API_ENDPOINTS.ADMIN_CATEGORIES,
          payload
        );
        newCategory = res.data.data;
        await fetchCategories();
        if (quickAdd && newCategory && newCategory._id) {
          setParent(newCategory._id);
          setName('');
          setError('');
        } else {
          handleClose();
        }
      }
    } catch (err) {
      const apiMessage = String(err?.response?.data?.message || '').trim();
      const apiErrors = Array.isArray(err?.response?.data?.errors) ? err.response.data.errors : [];
      if (apiMessage === 'validation_failed' && apiErrors.length > 0) {
        setError(apiErrors[0]);
        return;
      }
      if (apiMessage) {
        setError(apiMessage);
        return;
      }
      setError('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(
        API_ENDPOINTS.ADMIN_CATEGORY(id)
      );
      fetchCategories();
    } catch {
      alert('Delete failed');
    }
  };

  // Helper: Build a tree from flat category list
  function buildTree(list) {
    const map = {};
    const roots = [];
    list.forEach(cat => { map[cat._id] = { ...cat, children: [] }; });
    list.forEach(cat => {
      if (cat.parent && map[cat.parent]) {
        map[cat.parent].children.push(map[cat._id]);
      } else {
        roots.push(map[cat._id]);
      }
    });
    return roots;
  }

  // Collapsible tree state
  const [expanded, setExpanded] = useState({});
  const handleToggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper: Render tree rows with expand/collapse
  function renderRows(nodes, level = 0) {
    return nodes.flatMap(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isOpen = expanded[node._id];
      return [
        <TableRow key={node._id}>
          <TableCell>
            <span style={{ paddingLeft: level * 24 }}>
              {hasChildren && (
                <IconButton size="small" onClick={() => handleToggle(node._id)}>
                  {isOpen ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
              )}
              {node.name}
            </span>
          </TableCell>
          <TableCell align="right">
            <IconButton onClick={() => handleOpen(node)}><Edit /></IconButton>
            <IconButton color="error" onClick={() => handleDelete(node._id)}><Delete /></IconButton>
          </TableCell>
        </TableRow>,
        ...(hasChildren && isOpen ? renderRows(node.children, level + 1) : [])
      ];
    });
  }

  // Helper: Render dropdown options with indentation
  function renderOptions(nodes, level = 0, excludeId = null) {
    return nodes.flatMap(node => [
      node._id !== excludeId ? (
        <MenuItem key={node._id} value={node._id} style={{ paddingLeft: level * 24 }}>
          {node.name}
        </MenuItem>
      ) : null,
      ...renderOptions(node.children, level + 1, excludeId)
    ]);
  }

  const tree = buildTree(categories);

  const filteredParentTree = useMemo(() => {
    const query = String(parentSearch || '').trim().toLowerCase();
    if (!query) return tree;

    const filterNodes = (nodes) => nodes.reduce((acc, node) => {
      const childMatches = filterNodes(node.children || []);
      const selfMatches = String(node.name || '').toLowerCase().includes(query);
      if (!selfMatches && childMatches.length === 0) return acc;
      acc.push({
        ...node,
        children: childMatches,
      });
      return acc;
    }, []);

    return filterNodes(tree);
  }, [parentSearch, tree]);
  const hasCustomMin = minFileSizeBytes !== '' && !FILE_SIZE_OPTIONS.some((opt) => String(opt.value) === String(minFileSizeBytes));
  const hasCustomMax = maxFileSizeBytes !== '' && !FILE_SIZE_OPTIONS.some((opt) => String(opt.value) === String(maxFileSizeBytes));
  const hasCustomZipMin = zipMinFileSizeBytes !== '' && !ZIP_SIZE_OPTIONS.some((opt) => String(opt.value) === String(zipMinFileSizeBytes));
  const hasCustomZipMax = zipMaxFileSizeBytes !== '' && !ZIP_SIZE_OPTIONS.some((opt) => String(opt.value) === String(zipMaxFileSizeBytes));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Categories</Typography>
      <Button variant="contained" startIcon={<Add />} sx={{ my: 2 }} onClick={() => handleOpen()}>Add Category</Button>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderRows(tree)}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleModalAttemptClose}>
        <DialogTitle>{editCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Allowed MIME types (comma-separated)"
            fullWidth
            value={allowedMimeTypesInput}
            onChange={e => setAllowedMimeTypesInput(e.target.value)}
            placeholder="image/jpeg, image/png, video/mp4"
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="file-min-size-label">Min file size</InputLabel>
            <Select
              labelId="file-min-size-label"
              value={minFileSizeBytes}
              label="Min file size"
              onChange={e => setMinFileSizeBytes(e.target.value)}
            >
              <MenuItem value=''>Optional (use backend default)</MenuItem>
              {FILE_SIZE_OPTIONS.map((option) => (
                <MenuItem key={`file-min-${option.value}`} value={String(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
              {hasCustomMin ? (
                <MenuItem value={String(minFileSizeBytes)}>
                  Custom ({minFileSizeBytes} bytes)
                </MenuItem>
              ) : null}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="file-max-size-label">Max file size</InputLabel>
            <Select
              labelId="file-max-size-label"
              value={maxFileSizeBytes}
              label="Max file size"
              onChange={e => setMaxFileSizeBytes(e.target.value)}
            >
              <MenuItem value=''>Optional (use backend default)</MenuItem>
              {FILE_SIZE_OPTIONS.map((option) => (
                <MenuItem key={`file-max-${option.value}`} value={String(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
              {hasCustomMax ? (
                <MenuItem value={String(maxFileSizeBytes)}>
                  Custom ({maxFileSizeBytes} bytes)
                </MenuItem>
              ) : null}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="zip-mode-label">ZIP Mode</InputLabel>
            <Select
              labelId="zip-mode-label"
              value={zipMode}
              label="ZIP Mode"
              onChange={e => setZipMode(e.target.value)}
            >
              <MenuItem value=''>Inherit / Legacy default</MenuItem>
              <MenuItem value='hidden'>Hidden (not allowed)</MenuItem>
              <MenuItem value='optional'>Optional</MenuItem>
              <MenuItem value='required'>Required</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="ZIP allowed MIME types (comma-separated)"
            fullWidth
            value={zipAllowedMimeTypesInput}
            onChange={e => setZipAllowedMimeTypesInput(e.target.value)}
            placeholder="application/zip, application/x-zip-compressed"
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="zip-min-size-label">ZIP min file size</InputLabel>
            <Select
              labelId="zip-min-size-label"
              value={zipMinFileSizeBytes}
              label="ZIP min file size"
              onChange={e => setZipMinFileSizeBytes(e.target.value)}
            >
              <MenuItem value=''>Optional (use backend default)</MenuItem>
              {ZIP_SIZE_OPTIONS.map((option) => (
                <MenuItem key={`zip-min-${option.value}`} value={String(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
              {hasCustomZipMin ? (
                <MenuItem value={String(zipMinFileSizeBytes)}>
                  Custom ({zipMinFileSizeBytes} bytes)
                </MenuItem>
              ) : null}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="zip-max-size-label">ZIP max file size</InputLabel>
            <Select
              labelId="zip-max-size-label"
              value={zipMaxFileSizeBytes}
              label="ZIP max file size"
              onChange={e => setZipMaxFileSizeBytes(e.target.value)}
            >
              <MenuItem value=''>Optional (use backend default)</MenuItem>
              {ZIP_SIZE_OPTIONS.map((option) => (
                <MenuItem key={`zip-max-${option.value}`} value={String(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
              {hasCustomZipMax ? (
                <MenuItem value={String(zipMaxFileSizeBytes)}>
                  Custom ({zipMaxFileSizeBytes} bytes)
                </MenuItem>
              ) : null}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Search parent category"
            fullWidth
            value={parentSearch}
            onChange={e => setParentSearch(e.target.value)}
            placeholder="Type a main, sub, or sub-sub category name"
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="parent-select-label">Parent Category</InputLabel>
            <Select
              labelId="parent-select-label"
              value={parent || ''}
              label="Parent Category"
              onChange={e => setParent(e.target.value)}
            >
              <MenuItem value=''>None (Top-level)</MenuItem>
              {renderOptions(filteredParentTree, 0, editCategory?._id)}
              {parentSearch.trim() && filteredParentTree.length === 0 ? (
                <MenuItem value='' disabled>
                  No categories found
                </MenuItem>
              ) : null}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="SEO Meta Tags HTML"
            fullWidth
            multiline
            minRows={5}
            value={seoMetaTagsHtml}
            onChange={e => setSeoMetaTagsHtml(e.target.value)}
            placeholder={'<meta name="robots" content="index, follow" />\n<meta name="author" content="HDPiks Team" />'}
          />
          <TextField
            margin="dense"
            label="SEO Schema Script HTML"
            fullWidth
            multiline
            minRows={8}
            value={seoSchemaScriptHtml}
            onChange={e => setSeoSchemaScriptHtml(e.target.value)}
            placeholder={'<script type="application/ld+json">\n{\n  "@context": "https://schema.org"\n}\n</script>'}
          />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => handleSave(false)} variant="contained">Save & Close</Button>
          <Button onClick={() => handleSave(true)} variant="outlined">Save & Add Subcategory</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmExitOpen}
        onClose={(_event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
          }
          handleCancelExitConfirmation();
        }}
      >
        <DialogTitle>Exit without saving?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to exit? Unsaved changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelExitConfirmation}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmExit}>Exit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
