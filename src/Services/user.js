import api from './api.js';
import { API_ENDPOINTS } from '../config/api.config.js';


// Get all users
export const getAllUsers = async () => {
    const response = await api.get(API_ENDPOINTS.GET_ALL_USERS);
    return response.data.data;
};

// Get user by ID
export const getUserById = async (id) => {
    const response = await api.get(API_ENDPOINTS.GET_SINGLE_USER(id));
    return response.data.data;
};

// Delete user by ID
export const deleteUserById = async (id) => {
    const response = await api.delete(API_ENDPOINTS.DELETE_USER(id));
    return response.data;
};
