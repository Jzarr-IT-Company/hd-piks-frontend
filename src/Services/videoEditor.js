import api from "./api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const listVideoEditorProjects = async () => {
    const response = await api.get(API_ENDPOINTS.VIDEO_EDITOR_PROJECTS);
    return response?.data?.data?.projects || [];
};

export const createVideoEditorProject = async (payload = {}) => {
    const response = await api.post(API_ENDPOINTS.VIDEO_EDITOR_PROJECTS, payload);
    return response?.data?.data || null;
};

export const getVideoEditorProject = async (projectId) => {
    const response = await api.get(API_ENDPOINTS.VIDEO_EDITOR_PROJECT(projectId));
    return response?.data?.data || null;
};

export const deleteVideoEditorProject = async (projectId) => {
    const response = await api.delete(API_ENDPOINTS.VIDEO_EDITOR_DELETE_PROJECT(projectId));
    return response?.data?.data || null;
};

export const updateVideoEditorProject = async (projectId, payload = {}) => {
    const response = await api.patch(API_ENDPOINTS.VIDEO_EDITOR_PROJECT(projectId), payload);
    return response?.data?.data || null;
};

export const uploadVideoEditorAssets = async (projectId, files) => {
    const formData = new FormData();
    Array.from(files || []).forEach((file) => formData.append("files", file));
    const response = await api.post(API_ENDPOINTS.VIDEO_EDITOR_UPLOAD_ASSETS(projectId), formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        timeout: 240000,
    });
    return response?.data?.data || null;
};

export const createVideoEditorExport = async (projectId, presetId) => {
    const response = await api.post(API_ENDPOINTS.VIDEO_EDITOR_EXPORT(projectId), { presetId });
    return response?.data?.data || null;
};

export const getVideoEditorExportJob = async (jobId) => {
    const response = await api.get(API_ENDPOINTS.VIDEO_EDITOR_EXPORT_JOB(jobId));
    return response?.data?.data || null;
};

export const downloadVideoEditorExport = async (job, fallbackName = "video-export.mp4") => {
    const jobId = job?.id || job?._id || job;
    const response = await api.get(API_ENDPOINTS.VIDEO_EDITOR_EXPORT_DOWNLOAD(jobId), {
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
