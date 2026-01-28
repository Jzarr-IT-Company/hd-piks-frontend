import React, { useEffect, useState } from 'react';
import { fetchBlogCategories, createBlogCategory, updateBlogCategory, deleteBlogCategory } from '../../Services/blogCategory';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, FormControl } from '@mui/material';
import SimpleTreeView from '../components/SimpleTreeView';

export default function BlogCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', isActive: true, order: 0, parent: '' });

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchBlogCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  const handleOpen = (cat = null) => {
    setEditCategory(cat);
    setForm(cat ? { ...cat, parent: cat.parent || '' } : { name: '', slug: '', description: '', isActive: true, order: 0, parent: '' });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditCategory(null); };

  const handleSave = async () => {
    setLoading(true);
    const payload = { ...form, parent: form.parent || null };
    if (editCategory) {
      await updateBlogCategory(editCategory._id, payload);
    } else {
      await createBlogCategory(payload);
    }
    await loadCategories();
    handleClose();
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      setLoading(true);
      await deleteBlogCategory(id);
      await loadCategories();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Blog Categories</Typography>
      <Button variant="contained" sx={{ my: 2 }} onClick={() => handleOpen()}>Add Category</Button>
      <Box sx={{ my: 2 }}>
        <SimpleTreeView
          categories={categories}
          onEdit={handleOpen}
          onDelete={handleDelete}
        />
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <TextField label="Slug" fullWidth margin="normal" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required />
          <TextField label="Description" fullWidth margin="normal" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} multiline rows={2} />
          <TextField label="Order" type="number" fullWidth margin="normal" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
          <FormControlLabel control={<Switch checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />} label="Active" />
          <FormControl fullWidth margin="normal">
            <TextField select label="Parent Category" value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))} SelectProps={{ native: true }}>
              <option value="">None</option>
              {categories.filter(c => !editCategory || c._id !== editCategory._id).map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </TextField>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
