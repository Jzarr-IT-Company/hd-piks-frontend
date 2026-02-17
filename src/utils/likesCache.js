import { queryClient } from "../query/queryClient.js";

export const invalidateLikesRelatedQueries = async () => {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["asset-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["asset-related"] }),
        queryClient.invalidateQueries({ queryKey: ["creator-public-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["assets"] }),
        queryClient.invalidateQueries({ queryKey: ["images"] }),
    ]);
};

