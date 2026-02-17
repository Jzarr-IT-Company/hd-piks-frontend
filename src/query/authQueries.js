import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { getUserById } from "../Services/user.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const authQueryKeys = {
    currentUser: (id) => ["auth", "current-user", id],
    creatorMe: ["auth", "creator-me"],
};

export const useCurrentUserQuery = (id, enabled = true) => {
    return useQuery({
        queryKey: authQueryKeys.currentUser(id),
        queryFn: () => getUserById(id),
        enabled: Boolean(id) && enabled,
        staleTime: 2 * 60 * 1000,
    });
};

export const useCreatorMeQuery = (enabled = true) => {
    return useQuery({
        queryKey: authQueryKeys.creatorMe,
        queryFn: async () => {
            const response = await api.get(API_ENDPOINTS.CREATOR_ME);
            return response?.data?.data || null;
        },
        enabled,
        staleTime: 2 * 60 * 1000,
    });
};

