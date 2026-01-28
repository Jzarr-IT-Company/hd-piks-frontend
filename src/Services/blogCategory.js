import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export const fetchBlogCategories = async () => {
  const res = await api.get('/admin/blog-categories');
  return res.data.data || [];
};

export const createBlogCategory = async (data) => {
  const res = await api.post('/admin/blog-categories', data);
  return res.data.data;
};

export const updateBlogCategory = async (id, data) => {
  const res = await api.patch(`/admin/blog-categories/${id}`, data);
  return res.data.data;
};

export const deleteBlogCategory = async (id) => {
  await api.delete(`/admin/blog-categories/${id}`);
};
