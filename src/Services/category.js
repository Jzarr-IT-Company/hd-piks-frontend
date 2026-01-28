
import api from '../Services/api';

import { API_ENDPOINTS } from '../config/api.config';
// Fetch all categories (tree) from public endpoint
// Use public endpoint so all users (including creators) can fetch categories
// Fetch all categories (tree) from admin endpoint if creatorData exists
export const fetchCategories = async (isCreator) => {
  if (isCreator) {
    const res = await api.get(API_ENDPOINTS.ADMIN_CATEGORIES);
    return res.data.data || [];
  }
  // If not creator, return empty array (or you could fetch public if needed)
  return [];
};

// Build a tree from flat category list
export function buildCategoryTree(list) {
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
