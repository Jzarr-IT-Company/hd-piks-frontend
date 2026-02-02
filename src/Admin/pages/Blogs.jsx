import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, DialogContentText } from '@mui/material';
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
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const pendingCloseRef = useRef(false);
  const openedRef = useRef(false);
useEffect(() => {
    if (!openedRef.current) {
      window.open('https://hdpiks.com/blog/wp-admin', '_blank');
      openedRef.current = true;
    }
  }, []);
   
  

  return (

     
    
     null
    
    
  );

}

