// services/getImages.js

import api from './api.js';
import { API_ENDPOINTS } from '../config/api.config.js';

// Fetch all approved images (all creators)
export const getAllImages = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
       return response.data?.data || [];
    } catch (error) {
         console.error("Error fetching data:", error);
        throw error;
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
        console.error("Error fetching data:", error);
        throw error;
    }
};
