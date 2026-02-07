import api from '../Services/api';
import { API_ENDPOINTS } from '../config/api.config';

// Fetch public categories tree from /categories (no auth required)
export const fetchCategories = async () => {
	// Public: GET /categories -> { success: true, data: tree }
	try {
		const res = await api.get(API_ENDPOINTS.PUBLIC_CATEGORIES);
		const payload = res.data;
		if (Array.isArray(payload)) return payload;
		if (payload && Array.isArray(payload.data)) return payload.data;
		return [];
	} catch (err) {
		console.error('[fetchCategories] failed', err?.response?.data || err.message);
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
