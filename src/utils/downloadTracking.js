import Cookies from "js-cookie";
import api from "../Services/api";
import API_BASE_URL, { API_ENDPOINTS } from "../config/api.config";

export const trackAssetDownloadEvent = async ({ assetId, fileName }) => {
    if (!assetId) {
        const error = new Error("Missing asset id for download");
        error.status = 400;
        throw error;
    }

    const token = Cookies.get("token");
    if (!token) {
        const error = new Error("Please login to download this asset.");
        error.status = 401;
        throw error;
    }

    try {
        const response = await api.post(API_ENDPOINTS.TRACK_ASSET_DOWNLOAD(assetId), {
            fileName,
        });

        const relativeDownloadUrl = response?.data?.data?.downloadUrl || null;
        const absoluteDownloadUrl = relativeDownloadUrl
            ? (relativeDownloadUrl.startsWith("http")
                ? relativeDownloadUrl
                : `${API_BASE_URL}${relativeDownloadUrl}`)
            : null;

        return {
            tracked: true,
            downloadUrl: absoluteDownloadUrl,
        };
    } catch (error) {
        const message = error?.response?.data?.message || error?.message || "Unable to download this asset.";
        const wrappedError = new Error(message);
        wrappedError.status = error?.response?.status || 500;
        throw wrappedError;
    }
};
