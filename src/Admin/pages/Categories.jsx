import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { Edit, Delete, Add, ExpandMore, ChevronRight } from '@mui/icons-material';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [parent, setParent] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN_CATEGORIES);
      setCategories(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch categories');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpen = (cat = null) => {
    setEditCategory(cat);
    setName(cat ? cat.name : '');
    setParent(cat && cat.parent ? cat.parent : '');
    setOpen(true);
    setError('');
  };
  const handleClose = () => {
    setOpen(false);
    setEditCategory(null);
    setName('');
    setParent('');
    setError('');
  };

  const handleSave = async (quickAdd = false) => {
    if (!name.trim()) { setError('Name required'); return; }
    try {
      let newCategory = null;
      if (editCategory) {
        await api.patch(
          API_ENDPOINTS.ADMIN_CATEGORY(editCategory._id),
          { name, parent: parent || null }
        );
        handleClose();
        fetchCategories();
      } else {
        const res = await api.post(
          API_ENDPOINTS.ADMIN_CATEGORIES,
          { name, parent: parent || null }
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
      <Dialog open={open} onClose={handleClose}>
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
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="parent-select-label">Parent Category</InputLabel>
            <Select
              labelId="parent-select-label"
              value={parent || ''}
              label="Parent Category"
              onChange={e => setParent(e.target.value)}
            >
              <MenuItem value=''>None (Top-level)</MenuItem>
              {renderOptions(tree, 0, editCategory?._id)}
            </Select>
          </FormControl>
          {error && <Typography color="error" variant="body2">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={() => handleSave(false)} variant="contained">Save & Close</Button>
          <Button onClick={() => handleSave(true)} variant="outlined">Save & Add Subcategory</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
