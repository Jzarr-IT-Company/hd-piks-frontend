// S3 Multipart Upload (for large files, e.g. ZIP)
export const multipartUploadToS3 = async (file, category, onProgress) => {
    // 5MB part size (S3 minimum for all but last part)
    const PART_SIZE = 5 * 1024 * 1024;
    const totalParts = Math.ceil(file.size / PART_SIZE);
    let uploadedBytes = 0;
    let abort = false;
    let abortReason = '';

    // 1. Initiate multipart upload
    const { data: initData } = await api.post(API_ENDPOINTS.S3_MULTIPART_INIT, {
        fileName: file.name,
        fileType: file.type,
        category
    });
    const uploadId = initData.uploadId;
    const key = initData.key;

    // 2. Upload each part
    const etags = [];
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        if (abort) break;
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const blob = file.slice(start, end);

        // Get presigned URL for this part
        const { data: partData } = await api.get(API_ENDPOINTS.S3_MULTIPART_PART_URL, {
            params: { key, uploadId, partNumber }
        });
        const presignedUrl = partData.url;

        // Upload part
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': file.type }
        });
        if (!response.ok) {
            abort = true;
            abortReason = `Upload failed while sending ZIP part ${partNumber}.`;
            break;
        }
        const rawEtag = response.headers.get('etag') || response.headers.get('ETag');
        const etag = typeof rawEtag === 'string' ? rawEtag.replaceAll('"', '').trim() : '';
        if (!etag) {
            abort = true;
            abortReason = 'ZIP upload completed a part but no ETag header was readable. Add ETag to DigitalOcean Spaces CORS Expose Headers.';
            break;
        }
        etags.push({ ETag: etag, PartNumber: partNumber });
        uploadedBytes += blob.size;
        if (onProgress) {
            onProgress(Math.round((uploadedBytes / file.size) * 100));
        }
    }

    // 3. Complete or abort
    if (abort) {
        try {
            await api.post(API_ENDPOINTS.S3_MULTIPART_ABORT, { key, uploadId });
        } catch (abortError) {
            console.warn('Multipart abort failed after ZIP upload error', abortError);
        }
        throw new Error(abortReason || 'Upload aborted due to part failure');
    }
    const { data: completeData } = await api.post(API_ENDPOINTS.S3_MULTIPART_COMPLETE, {
        key,
        uploadId,
        parts: etags
    });
    const completedS3Url =
        completeData?.result?.s3Url ||
        completeData?.result?.Location ||
        (import.meta.env.VITE_AWS_DOMAIN ? `https://${import.meta.env.VITE_AWS_DOMAIN}/${key}` : '');

    return {
        s3Key: key,
        s3Url: completedS3Url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        completeData
    };
};
import api from './api.js';
import { API_ENDPOINTS } from '../config/api.config.js';

// Get presigned URL for upload from backend
export const getPresignedUploadUrl = async (fileName, fileType, fileSize, category, subcategory, subsubcategory) => {
    const response = await api.post(API_ENDPOINTS.GET_PRESIGNED_URL, {
        fileName,
        fileType,
        fileSize,
        category,
        subcategory,
        subsubcategory
    });
    return response.data.data;
};

// Upload file directly to S3 using presigned URL (bypasses backend)
export const uploadFileToS3 = async (presignedUrl, file, onProgress, uploadHeaders = {}) => {
    // Direct PUT request to S3 - not using our api instance
    const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
            ...uploadHeaders
        }
    });

    if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.statusText}`);
    }
    if (onProgress) onProgress(100);
    return response;
};

// Delete file from S3 via backend
export const deleteFileFromS3 = async (s3Key) => {
    const response = await api.post(API_ENDPOINTS.DELETE_S3_FILE, {
        s3Key
    });
    return response.data;
};

// Composite function: Get presigned URL and upload file to S3
export const uploadImageToS3 = async (file, onProgress, category, subcategory, subsubcategory) => {
    // Step 1: Get presigned URL from backend
    const { presignedUrl, s3Key, s3Url, uploadHeaders } = await getPresignedUploadUrl(
        file.name,
        file.type,
        file.size,
        category,
        subcategory,
        subsubcategory
    );

    // Step 2: Upload file directly to S3 using presigned URL
    await uploadFileToS3(presignedUrl, file, onProgress, uploadHeaders);

    // Return S3 details for storage in database
    return {
        s3Key,
        s3Url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString()
    };
};

// Upload multiple files to S3
export const uploadMultipleFilesToS3 = async (files, onProgressCallback, category, subcategory, subsubcategory) => {
    const uploadPromises = files.map(async (file, index) => {
        const onProgress = (progress) => {
            if (onProgressCallback) {
                onProgressCallback(index, progress);
            }
        };
        return await uploadImageToS3(file, onProgress, category, subcategory, subsubcategory);
    });

    const results = await Promise.all(uploadPromises);
    return results;
};

// Get file size formatted
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default {
    uploadImageToS3,
    uploadMultipleFilesToS3,
    getPresignedUploadUrl,
    uploadFileToS3,
    deleteFileFromS3,
    formatFileSize
};
