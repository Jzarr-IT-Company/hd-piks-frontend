import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const useCreatorPublicProfileQuery = (creatorId, page = 1, limit = 12) => {
    return useQuery({
        queryKey: ["creator-public-profile", creatorId || "none", page, limit],
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.GET_PUBLIC_CREATOR_PROFILE(creatorId), {
                params: { page, limit },
            });
            return response?.data?.data || null;
        },
        enabled: Boolean(creatorId),
        staleTime: 60 * 1000,
    });
};

