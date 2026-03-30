import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const PAGE_SIZE = 16;

const requestAssetsPage = async ({ page = 1, limit = PAGE_SIZE, parentCategory }) => {
    const params = {
        page,
        limit,
    };
    if (parentCategory && parentCategory !== "all") {
        params.parentCategory = parentCategory;
    }
    const response = await api.get(API_ENDPOINTS.ASSETS, { params });
    const payload = response?.data || {};
    const data = Array.isArray(payload?.data) ? payload.data : [];
    const currentPage = Number(payload?.page) || page;
    const pageSize = Number(payload?.limit) || limit;
    const total = Number(payload?.total) || 0;
    const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
    const hasMore = typeof payload?.hasMore === 'boolean'
        ? payload.hasMore
        : currentPage < totalPages;

    return {
        items: data,
        page: currentPage,
        limit: pageSize,
        total,
        totalPages,
        hasMore,
    };
};

const fetchAssetsPage = async ({ pageParam = 1, queryKey }) => {
    const [, parentCategory] = queryKey;
    return requestAssetsPage({ page: pageParam, parentCategory });
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

export const useAssetsPageQuery = (parentCategory, page = 1, limit = PAGE_SIZE) => {
    return useQuery({
        queryKey: ["assets", "page", parentCategory || "all", page, limit],
        queryFn: () => requestAssetsPage({ page, limit, parentCategory }),
        staleTime: 60 * 1000,
        keepPreviousData: true,
    });
};
