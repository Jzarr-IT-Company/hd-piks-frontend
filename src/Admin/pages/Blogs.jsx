import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlogForm from '../components/BlogForm';
import { fetchPublicBlogs, createBlog, updateBlog, deleteBlog } from '../../Services/blog';
import api from '../../Services/api';
import Cookies from 'js-cookie';
import { API_ENDPOINTS } from '../../config/api.config';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Check if user is admin by attempting to fetch all blogs with admin token
        const token = Cookies.get('token');
        let isAdmin = false;
        if (token) {
          try {
            const res = await api.get('/blogs', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(res.data.data || []);
            isAdmin = true;
          } catch (err) {
            // If 403, not admin, fallback to public
            if (err.response && err.response.status === 403) {
              isAdmin = false;
            } else {
              throw err;
            }
          }
        }
        if (!isAdmin) {
          const data = await fetchPublicBlogs();
          setBlogs(data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleOpen = (blog = null) => {
    setEditBlog(blog);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditBlog(null);
  };
  const handleSave = async (blogData) => {
    setLoading(true);
    if (editBlog) {
      await updateBlog(editBlog._id, blogData);
    } else {
      await createBlog(blogData);
    }
    // After create/update, always refresh with admin endpoint if possible
    try {
      const token = Cookies.get('token');
      const res = await api.get('/blogs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(res.data.data || []);
    } catch (err) {
      // fallback to public
      const data = await fetchPublicBlogs();
      setBlogs(data);
    }
    setLoading(false);
    handleClose();
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this blog?')) {
      setLoading(true);
      await deleteBlog(id);
      try {
        const token = Cookies.get('token');
        const res = await api.get('/blogs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogs(res.data.data || []);
      } catch (err) {
        // fallback to public
        const data = await fetchPublicBlogs();
        setBlogs(data);
      }
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Blogs</Typography>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ my: 2 }} onClick={() => handleOpen()}>Add Blog</Button>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blogs.map(blog => (
                <TableRow key={blog._id}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.status}</TableCell>
                  <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(blog)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(blog._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editBlog ? 'Edit Blog' : 'Add Blog'}</DialogTitle>
        <DialogContent>
          <BlogForm blog={editBlog} onClose={handleClose} onSave={handleSave} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

}

