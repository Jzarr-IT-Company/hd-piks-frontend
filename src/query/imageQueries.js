import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

const parseImages = (payload) => {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
};

const fetchAllImages = async () => {
    const response = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
    return parseImages(response?.data);
};

const fetchImagesByCreatorId = async (creatorId) => {
    const response = await api.post(API_ENDPOINTS.GET_IMAGES_BY_CREATOR_ID, { id: creatorId });
    return parseImages(response?.data);
};

export const useAllImagesQuery = (enabled = true) => {
    return useQuery({
        queryKey: ["images", "all"],
        queryFn: fetchAllImages,
        enabled,
        staleTime: 60 * 1000,
    });
};

export const useCreatorImagesQuery = (creatorId, enabled = true) => {
    return useQuery({
        queryKey: ["images", "creator", creatorId || "none"],
        queryFn: () => fetchImagesByCreatorId(creatorId),
        enabled: Boolean(creatorId) && enabled,
        staleTime: 60 * 1000,
    });
};

export const useCreatorsMapQuery = (creatorIds = []) => {
    const stableIds = [...(creatorIds || [])].map(String).filter(Boolean).sort();
    return useQuery({
        queryKey: ["creators", "map", stableIds],
        queryFn: async () => {
            if (!stableIds.length) return {};
            const pairs = await Promise.all(
                stableIds.map(async (id) => {
                    try {
                        const response = await api.get(API_ENDPOINTS.GET_CREATOR_BY_ID(id));
                        return [id, response?.data?.data || null];
                    } catch (err) {
                        if (err?.response?.status !== 404) {
                            console.error("[useCreatorsMapQuery] failed", id, err);
                        }
                        return [id, null];
                    }
                })
            );
            return pairs.reduce((acc, [id, creator]) => {
                if (creator) acc[id] = creator;
                return acc;
            }, {});
        },
        enabled: stableIds.length > 0,
        staleTime: 5 * 60 * 1000,
    });
};

