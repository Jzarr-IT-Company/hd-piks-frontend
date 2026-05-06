import API_BASE_URL, { API_ENDPOINTS } from "../config/api.config.js";
import api from "./api.js";

const PDF_TOOLS_SESSION_KEY = "elvifyPdfToolsSessionId";

const getPdfToolsSessionId = () => {
    if (typeof window === "undefined") return "";
    try {
        const existing = String(window.localStorage.getItem(PDF_TOOLS_SESSION_KEY) || "").trim();
        if (existing) return existing;
        const bytes = new Uint8Array(12);
        window.crypto.getRandomValues(bytes);
        const sessionId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
        window.localStorage.setItem(PDF_TOOLS_SESSION_KEY, sessionId);
        return sessionId;
    } catch {
        return "";
    }
};

const getPdfToolsRequestHeaders = () => {
    const sessionId = getPdfToolsSessionId();
    return sessionId ? { "x-pdf-tools-session-id": sessionId } : {};
};

export const uploadPdfToolFiles = async (files) => {
    const formData = new FormData();
    Array.from(files || []).forEach((file) => formData.append("files", file));
    const response = await api.post(API_ENDPOINTS.PDF_TOOLS_UPLOAD, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            ...getPdfToolsRequestHeaders(),
        },
    });
    return response?.data?.data || { files: [] };
};

export const createPdfToolJob = async (endpoint, fileIds, options = {}) => {
    const response = await api.post(endpoint, {
        fileIds,
        ...options,
    }, {
        headers: getPdfToolsRequestHeaders(),
    });
    return response?.data?.data || null;
};

export const getPdfToolJob = async (jobId) => {
    const response = await api.get(API_ENDPOINTS.PDF_TOOLS_JOB(jobId), {
        headers: getPdfToolsRequestHeaders(),
    });
    return response?.data?.data || null;
};

export const exportEditedPdf = async (fileId, elements) => {
    const response = await api.post(API_ENDPOINTS.PDF_TOOLS_EDITOR_EXPORT, {
        fileId,
        elements,
    }, {
        headers: getPdfToolsRequestHeaders(),
    });
    return response?.data?.data || null;
};

export const absolutePdfToolUrl = (url) => `${API_BASE_URL}${url}`;

export const rawPdfToolFileUrl = (fileId) =>
    absolutePdfToolUrl(API_ENDPOINTS.PDF_TOOLS_FILE_DOWNLOAD(fileId));

export const getPdfToolFileBlobUrl = async (fileId) => {
    const response = await api.get(API_ENDPOINTS.PDF_TOOLS_FILE_DOWNLOAD(fileId), {
        responseType: "blob",
        headers: getPdfToolsRequestHeaders(),
    });
    return URL.createObjectURL(response.data);
};

export const downloadPdfToolJob = async (job, fallbackName = "output.pdf") => {
    const jobId = job?.id || job?._id || job;
    const response = await api.get(API_ENDPOINTS.PDF_TOOLS_JOB_DOWNLOAD(jobId), {
        responseType: "blob",
        headers: getPdfToolsRequestHeaders(),
    });
    const blobUrl = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = job?.outputName || fallbackName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};
