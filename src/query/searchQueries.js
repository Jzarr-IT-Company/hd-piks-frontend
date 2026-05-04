import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const SEARCH_ASSET_LIMIT = 16;

const normalizeSearchPayload = (payload = {}, fallback = {}) => ({
    category: payload.category || fallback.category || "Image",
    query: payload.query || fallback.q || "",
    resolved: payload.resolved || {},
    data: Array.isArray(payload.data) ? payload.data : [],
    suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : [],
    popularSubcategories: Array.isArray(payload.popularSubcategories) ? payload.popularSubcategories : [],
    exploreAssets: Array.isArray(payload.exploreAssets) ? payload.exploreAssets : [],
    page: Number(payload.page) || fallback.page || 1,
    limit: Number(payload.limit) || fallback.limit || SEARCH_ASSET_LIMIT,
    total: Number(payload.total) || 0,
    hasMore: Boolean(payload.hasMore),
});

export const useSearchSuggestionsQuery = ({ category, q, enabled = true }) => {
    const query = String(q || "").trim();
    const categoryValue = category || "Image";

    return useQuery({
        queryKey: ["search-suggestions", categoryValue, query],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.SEARCH_SUGGESTIONS, {
                params: { category: categoryValue, q: query },
            });
            return Array.isArray(response?.data?.suggestions) ? response.data.suggestions : [];
        },
        enabled: enabled && Boolean(categoryValue),
        staleTime: 5 * 60 * 1000,
    });
};

export const useSearchAssetsQuery = ({ category, q, page = 1, enabled = true }) => {
    const query = String(q || "").trim();
    const categoryValue = category || "Image";

    return useQuery({
        queryKey: ["search-assets", categoryValue, query, page],
        queryFn: async () => {
            const params = {
                category: categoryValue,
                q: query,
                page,
                limit: SEARCH_ASSET_LIMIT,
            };
            const response = await api.get(API_ENDPOINTS.SEARCH_ASSETS, { params });
            return normalizeSearchPayload(response?.data, params);
        },
        enabled: enabled && Boolean(categoryValue) && Boolean(query),
        staleTime: 2 * 60 * 1000,
        keepPreviousData: true,
    });
};
