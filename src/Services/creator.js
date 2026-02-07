import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export const getAllCreatorsData = async () => {
    try {
        const res = await api.get(API_ENDPOINTS.GET_ALL_CREATORS);
        return res.data?.data || [];
    } catch (error) {
        if (error.response?.status === 404) {
            console.warn('[creator] /creators endpoint not found; returning empty creator list.');
            return [];
        }
        console.error('[creator] Failed to load creators:', error);
        throw error;
    }
};

export const getCreatorById = async (id) => {
    const response = await api.get(API_ENDPOINTS.GET_CREATOR_BY_ID(id));
    return response.data;
};

export default {
    getAllCreatorsData,
    getCreatorById
};
