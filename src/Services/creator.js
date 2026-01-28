import api from './api';

const API_ENDPOINTS = {
    GET_ALL_CREATORS: '/creators', // get all creators
    GET_CREATOR_BY_ID: id => `/creators/${id}` // get creator by ID
};

export const getAllCreatorsData = async () => {
    const response = await api.get(API_ENDPOINTS.GET_ALL_CREATORS);
    return response.data.data;
};

export const getCreatorById = async (id) => {
    const response = await api.get(API_ENDPOINTS.GET_CREATOR_BY_ID(id));
    return response.data;
};

export default {
    getAllCreatorsData,
    getCreatorById
};
