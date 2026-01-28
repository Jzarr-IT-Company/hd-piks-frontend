import { useQuery } from '@tanstack/react-query';
import { getAllDataFromDb } from '../Services/getImages';

function UseImages() {
    const fetchData = async () => {
        const response = await getAllDataFromDb();
        if (Array.isArray(response)) {
            const excludedCategories = ["mockups", "vector", "psd", "templates", "icon", "nfts"];
            return response.filter(item => !excludedCategories.includes(item.category));
        }
        return [];
    };
    return useQuery({
        queryKey: ['images'],
        queryFn: fetchData,
        staleTime: 0, // Always stale, always refetch
        cacheTime: 0, // No cache, always refetch
        enabled: true,
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnReconnect: true, // Refetch on reconnect
        onError: (error) => {
            console.error('Error fetching images:', error);
        },
        onSuccess: (data) => {
            console.log('Fetched images:', data);
        }
    });
}

export default UseImages;
