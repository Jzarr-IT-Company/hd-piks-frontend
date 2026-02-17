import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

const parseCategoriesPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
};

export const fetchPublicCategories = async () => {
    const response = await api.get(API_ENDPOINTS.PUBLIC_CATEGORIES);
    return parseCategoriesPayload(response?.data);
};

export const usePublicCategoriesQuery = () => {
    return useQuery({
        queryKey: ["categories", "public"],
        queryFn: fetchPublicCategories,
        staleTime: 5 * 60 * 1000,
    });
};

