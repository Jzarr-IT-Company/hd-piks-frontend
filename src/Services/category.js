import api from '../Services/api';
import { API_ENDPOINTS } from '../config/api.config';

export const fetchCategories = async (isCreator) => {
  if (!isCreator) return [];

  try {
    // Uses backend route: GET /categories (auth + creatorId required)
    const res = await api.get(API_ENDPOINTS.PUBLIC_CATEGORIES);
    console.log(res.data.data);
  
    return res.data?.data || res.data || [];
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('[fetchCategories] /categories not implemented on backend.');
    } else if (error.response?.status === 403) {
      console.error('[fetchCategories] Forbidden: current user is not allowed to read categories.', error);
    } else {
      console.error('[fetchCategories] Failed to load categories', error);
    }
    return [];
  }
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
