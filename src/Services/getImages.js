// services/getImages.js

import api from './api.js';
import { API_ENDPOINTS } from '../config/api.config.js';

// Fetch all approved images (all creators)
export const getAllImages = async () => {
    try {
        console.log('[getAllImages] Requesting:', API_ENDPOINTS.GET_ALL_IMAGES);
        const response = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
        console.log('[getAllImages] Status:', response.status);
        return response.data?.data || [];
    } catch (error) {
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message || error.response?.data;
        console.error('[getAllImages] Error fetching data:', status, backendMessage || error);
        // Avoid crashing UI; return empty list when backend fails
        return [];
    }
};

// Fetch all images for a specific creator
export const getImagesByCreatorId = async (creatorId) => {
    const response = await api.post(API_ENDPOINTS.GET_IMAGES_BY_CREATOR_ID, { id: creatorId });
    return response.data?.data || [];
};

export const getAllDataFromDb = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
        return response.data.data;
    } catch (error) {
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message || error.response?.data;
        console.error('[getAllDataFromDb] Error fetching data:', status, backendMessage || error);
        return [];
    }
};
