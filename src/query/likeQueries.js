import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

const normalizeIds = (assetIds = []) => {
    return [...new Set((assetIds || []).map(String).filter(Boolean))].sort();
};

export const useAssetLikeStatusBatchQuery = (assetIds = [], enabled = true) => {
    const stableIds = normalizeIds(assetIds);

    return useQuery({
        queryKey: ["asset-like-status", "batch", stableIds],
        queryFn: async () => {
            if (!stableIds.length) return {};
            const response = await api.post(API_ENDPOINTS.ASSET_LIKE_STATUS_BATCH, {
                assetIds: stableIds,
            });
            return response?.data?.data || {};
        },
        enabled: enabled && stableIds.length > 0,
        staleTime: 2 * 60 * 1000,
    });
};
