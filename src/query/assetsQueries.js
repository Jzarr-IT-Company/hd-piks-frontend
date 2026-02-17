import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

const PAGE_SIZE = 16;

const fetchAssetsPage = async ({ pageParam = 1, queryKey }) => {
    const [, parentCategory] = queryKey;
    const params = {
        page: pageParam,
        limit: PAGE_SIZE,
    };
    if (parentCategory && parentCategory !== "all") {
        params.parentCategory = parentCategory;
    }
    const response = await api.get(API_ENDPOINTS.ASSETS, { params });
    const data = response?.data?.data || [];
    return {
        page: pageParam,
        items: Array.isArray(data) ? data : [],
        hasMore: Array.isArray(data) && data.length === PAGE_SIZE,
    };
};

export const useAssetsInfiniteQuery = (parentCategory) => {
    return useInfiniteQuery({
        queryKey: ["assets", parentCategory || "all"],
        queryFn: fetchAssetsPage,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage?.hasMore) return undefined;
            return (lastPage.page || 1) + 1;
        },
        staleTime: 60 * 1000,
    });
};

