import { QueryClient } from "@tanstack/react-query";

const shouldRetryQuery = (failureCount, error) => {
    const status = error?.response?.status;
    if (status && status < 500) return false;
    return failureCount < 2;
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: shouldRetryQuery,
        },
        mutations: {
            retry: 1,
        },
    },
});

