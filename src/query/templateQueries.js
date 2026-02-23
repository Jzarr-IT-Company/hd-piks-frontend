import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

const sanitizeQueryParams = (params = {}) => {
  const next = {};
  if (params.search) next.search = String(params.search).trim();
  if (params.category) next.category = String(params.category).trim();
  if (params.type && params.type !== "all") next.type = String(params.type).trim().toLowerCase();
  if (params.page) next.page = Number(params.page) || 1;
  if (params.limit) next.limit = Number(params.limit) || 20;
  return next;
};

export const useTemplatesQuery = (params = {}, enabled = true) => {
  const queryParams = sanitizeQueryParams(params);
  return useQuery({
    queryKey: ["templates", queryParams],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.TEMPLATES, { params: queryParams });
      const data = response?.data || {};
      return {
        items: Array.isArray(data?.data) ? data.data : [],
        pagination: data?.pagination || null,
      };
    },
    enabled,
    staleTime: 60 * 1000,
  });
};

