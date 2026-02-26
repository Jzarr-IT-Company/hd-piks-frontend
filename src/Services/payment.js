import api from "./api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const getAssetPurchaseStatus = async (assetId) => {
    const response = await api.get(API_ENDPOINTS.ASSET_PURCHASE_STATUS(assetId));
    return response?.data?.data || null;
};

export const createAssetPaymentIntent = async (assetId) => {
    const response = await api.post(API_ENDPOINTS.CREATE_ASSET_PAYMENT_INTENT(assetId));
    return response?.data?.data || null;
};

export const getMyOrders = async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.ME_ORDERS, { params });
    return {
        data: response?.data?.data || [],
        pagination: response?.data?.pagination || null,
    };
};

export const getMyPurchases = async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.ME_PURCHASES, { params });
    return {
        data: response?.data?.data || [],
        pagination: response?.data?.pagination || null,
    };
};
