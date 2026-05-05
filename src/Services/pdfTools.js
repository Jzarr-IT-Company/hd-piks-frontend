import API_BASE_URL, { API_ENDPOINTS } from "../config/api.config.js";
import api from "./api.js";

export const uploadPdfToolFiles = async (files) => {
    const formData = new FormData();
    Array.from(files || []).forEach((file) => formData.append("files", file));
    const response = await api.post(API_ENDPOINTS.PDF_TOOLS_UPLOAD, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response?.data?.data || { files: [] };
};

export const createPdfToolJob = async (endpoint, fileIds, options = {}) => {
    const response = await api.post(endpoint, {
        fileIds,
        ...options,
    });
    return response?.data?.data || null;
};

export const getPdfToolJob = async (jobId) => {
    const response = await api.get(API_ENDPOINTS.PDF_TOOLS_JOB(jobId));
    return response?.data?.data || null;
};

export const exportEditedPdf = async (fileId, elements) => {
    const response = await api.post(API_ENDPOINTS.PDF_TOOLS_EDITOR_EXPORT, {
        fileId,
        elements,
    });
    return response?.data?.data || null;
};

export const absolutePdfToolUrl = (url) => `${API_BASE_URL}${url}`;

export const rawPdfToolFileUrl = (fileId) =>
    absolutePdfToolUrl(API_ENDPOINTS.PDF_TOOLS_FILE_DOWNLOAD(fileId));

export const getPdfToolFileBlobUrl = async (fileId) => {
    const response = await api.get(API_ENDPOINTS.PDF_TOOLS_FILE_DOWNLOAD(fileId), {
        responseType: "blob",
    });
    return URL.createObjectURL(response.data);
};

export const downloadPdfToolJob = async (job, fallbackName = "output.pdf") => {
    const jobId = job?.id || job?._id || job;
    const response = await api.get(API_ENDPOINTS.PDF_TOOLS_JOB_DOWNLOAD(jobId), {
        responseType: "blob",
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
