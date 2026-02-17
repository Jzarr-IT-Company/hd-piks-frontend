import Cookies from "js-cookie";
import api from "../Services/api";
import { API_ENDPOINTS } from "../config/api.config";

export const trackAssetDownloadEvent = async ({ assetId, fileName }) => {
    if (!assetId) {
        return {
            tracked: false,
            downloadUrl: null,
        };
    }
    const token = Cookies.get("token");
    if (!token) {
        return {
            tracked: false,
            downloadUrl: null,
        };
    }

    try {
        const response = await api.post(API_ENDPOINTS.TRACK_ASSET_DOWNLOAD(assetId), {
            fileName,
        });
        return {
            tracked: true,
            downloadUrl: response?.data?.data?.downloadUrl || null,
        };
    } catch (error) {
        if (import.meta.env.MODE === "development") {
            console.warn("[download-tracking] failed", error?.response?.data || error?.message);
        }
        return {
            tracked: false,
            downloadUrl: null,
        };
    }
};
