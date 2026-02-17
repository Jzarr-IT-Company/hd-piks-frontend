import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const useAssetDetailQuery = (assetId) => {
    return useQuery({
        queryKey: ["asset-detail", assetId || "none"],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.GET_PUBLIC_ASSET_BY_ID(assetId));
            return response?.data?.data || null;
        },
        enabled: Boolean(assetId),
        staleTime: 60 * 1000,
    });
};

export const useRelatedAssetsQuery = (assetId, enabled = true) => {
    return useQuery({
        queryKey: ["asset-related", assetId || "none"],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.GET_RELATED_ASSETS(assetId), {
                params: { limit: 12 },
            });
            const payload = response?.data?.data || {};
            return {
                similar: payload?.similar || [],
                fromCreator: payload?.fromCreator || [],
                groups: payload?.groups || {
                    sameSubcategory: [],
                    keywordMatched: [],
                    sameCategory: [],
                    fallbackLatest: [],
                },
            };
        },
        enabled: Boolean(assetId) && enabled,
        staleTime: 60 * 1000,
    });
};
