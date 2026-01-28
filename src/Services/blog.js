import api from './api';
import { API_ENDPOINTS } from '../config/api.config.js';
// Fetch all published blogs (public, for users, homepage, trending, etc.)
export const fetchPublicBlogs = async () => {
  const res = await api.get('/blogs/public');
  return res.data.data || [];
};

// Fetch a published blog by slug (public, for detail page)
export const fetchBlogBySlug = async (slug) => {
  const res = await api.get(`/blogs/slug/${slug}`);
  return res.data.data;
};

export const fetchBlogById = async (id) => {
  const res = await api.get(API_ENDPOINTS.ADMIN_BLOG(id));
  return res.data.data;
};

export const createBlog = async (data) => {
  const res = await api.post(API_ENDPOINTS.ADMIN_BLOGS, data);
  return res.data.data;
};

export const updateBlog = async (id, data) => {
  const res = await api.patch(API_ENDPOINTS.ADMIN_BLOG(id), data);
  return res.data.data;
};

export const deleteBlog = async (id) => {
  await api.delete(API_ENDPOINTS.ADMIN_BLOG(id));
};
