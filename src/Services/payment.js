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

export const createAssetCheckout = async (assetId, provider = 'stripe') => {
    const response = await api.post(API_ENDPOINTS.CREATE_ASSET_CHECKOUT(assetId), { provider });
    return response?.data?.data || null;
};

export const capturePayPalAssetOrder = async ({ paypalOrderId, orderId } = {}) => {
    const response = await api.post(API_ENDPOINTS.CAPTURE_PAYPAL_ORDER, {
        paypalOrderId,
        orderId,
    });
    return response?.data?.data || null;
};

export const cancelPayPalAssetOrder = async ({
    paypalOrderId,
    orderId,
    status = 'canceled',
    note = '',
} = {}) => {
    const response = await api.post(API_ENDPOINTS.CANCEL_PAYPAL_ORDER, {
        paypalOrderId,
        orderId,
        status,
        note,
    });
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

export const getMyPurchaseDetail = async (purchaseId) => {
    const response = await api.get(API_ENDPOINTS.ME_PURCHASE_DETAIL(purchaseId));
    return response?.data?.data || null;
};

export const createSubscriptionCheckout = async (planCode, provider = 'stripe') => {
    const response = await api.post(API_ENDPOINTS.CREATE_SUBSCRIPTION_CHECKOUT(planCode), { provider });
    return response?.data?.data || null;
};

export const capturePayPalSubscriptionOrder = async ({ paypalOrderId, orderId } = {}) => {
    const response = await api.post(API_ENDPOINTS.CAPTURE_PAYPAL_SUBSCRIPTION_ORDER, {
        paypalOrderId,
        orderId,
    });
    return response?.data?.data || null;
};

export const cancelPayPalSubscriptionOrder = async ({
    paypalOrderId,
    orderId,
    status = 'canceled',
    note = '',
} = {}) => {
    const response = await api.post(API_ENDPOINTS.CANCEL_PAYPAL_SUBSCRIPTION_ORDER, {
        paypalOrderId,
        orderId,
        status,
        note,
    });
    return response?.data?.data || null;
};

export const getMySubscription = async () => {
    const response = await api.get(API_ENDPOINTS.ME_SUBSCRIPTION);
    return response?.data?.data || null;
};

export const getMySubscriptionOrders = async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.ME_SUBSCRIPTION_ORDERS, { params });
    return {
        data: response?.data?.data || [],
        pagination: response?.data?.pagination || null,
    };
};
