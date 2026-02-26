import React, { useState } from 'react';
import { useUpload } from '../../Context/UploadContext';
import { useAuth } from '../../Context/AuthContext';
import api from '../../Services/api.js';
import { API_ENDPOINTS } from '../../config/api.config.js';
import { message, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

function UploadBtn({ isZipRequired = false, uploadPolicy = null, zipPolicy = null }) {
    const ZIP_MODE_HIDDEN = 'hidden';
    const ZIP_MODE_OPTIONAL = 'optional';
    const ZIP_MODE_REQUIRED = 'required';
    const MIN_ZIP_BYTES = 1 * 1024 * 1024; // 1MB
    const MAX_ZIP_BYTES = 500 * 1024 * 1024; // 500MB
    const DEFAULT_ZIP_ALLOWED_MIME_TYPES = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
    const formatBytesAsMb = (bytes) => {
        const numeric = Number(bytes || 0);
        if (!Number.isFinite(numeric) || numeric <= 0) return '0 MB';
        const mb = numeric / (1024 * 1024);
        const rounded = mb >= 10 ? mb.toFixed(0) : mb.toFixed(2).replace(/\.00$/, '');
        return `${rounded} MB`;
    };
    const formatSizeHint = (bytes) => `${formatBytesAsMb(bytes)} (${bytes} bytes)`;
    const {
        category,
        setCategory,
        selectedSubCategory,
        setSelectedSubCategory,
        selectedSubSubCategory,
        setSelectedSubSubCategory,
        selectPlan,
        setSelectPlan,
        title,
        setTitle,
        description,
        setDescription,
        imageSize,
        setImageSize,
        imageType,
        setImageType,
        imageUrl,
        setImageUrl,
        expireDate,
        zipFolder,
        setZipFolder,
        zipFolderUrl,
        setZipFolderUrl,
        termsChecked,
        setTermsChecked,
        contentChecked,
        setContentChecked,
        keywords,
        setKeywords,
        imageData,
        // S3 fields
        s3Keys,
        s3Urls,
        fileMetadata
    } = useUpload();
    const { creatorData } = useAuth();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    const isEditing = !!editId;

    const handleUpload = async () => {
        const normalizedPlan = selectPlan ? selectPlan.toLowerCase() : null;
        const errors = [];

        const zipFromState = Array.isArray(zipFolder) ? zipFolder[0] : zipFolder;
        const zipKeyFromState = typeof zipFromState === 'string'
            ? zipFromState
            : (zipFromState?.s3Key || zipFromState?.key || '');
        const zipSizeFromState = typeof zipFromState === 'object' ? Number(zipFromState?.fileSize || 0) : 0;
        const zipMimeTypeFromState = typeof zipFromState === 'object' ? (zipFromState?.mimeType || '') : '';
        const zipFileNameFromState = typeof zipFromState === 'object' ? (zipFromState?.fileName || '') : '';

        const normalizedZipFolderUrl = (typeof zipFolderUrl === 'string' && zipFolderUrl)
            || (typeof zipFromState === 'object' ? (zipFromState?.url || '') : '');

        const resolvedZipMode = ['hidden', 'optional', 'required'].includes(String(zipPolicy?.zipMode || '').toLowerCase())
            ? String(zipPolicy.zipMode).toLowerCase()
            : (isZipRequired ? ZIP_MODE_REQUIRED : ZIP_MODE_OPTIONAL);
        const isZipHidden = resolvedZipMode === ZIP_MODE_HIDDEN;
        const zipMinSize = zipPolicy?.minFileSizeBytes !== null && zipPolicy?.minFileSizeBytes !== undefined
            ? Number(zipPolicy.minFileSizeBytes)
            : MIN_ZIP_BYTES;
        const zipMaxSize = zipPolicy?.maxFileSizeBytes !== null && zipPolicy?.maxFileSizeBytes !== undefined
            ? Number(zipPolicy.maxFileSizeBytes)
            : MAX_ZIP_BYTES;
        const zipMimeAllowList = Array.isArray(zipPolicy?.allowedMimeTypes) && zipPolicy.allowedMimeTypes.length
            ? zipPolicy.allowedMimeTypes
            : DEFAULT_ZIP_ALLOWED_MIME_TYPES;
        const normalizedZipMimeType = String(zipMimeTypeFromState || '').trim().toLowerCase();
        const normalizedZipSourceName = String(zipFileNameFromState || zipKeyFromState || normalizedZipFolderUrl || '');

        const normalizedZipFolder = zipKeyFromState
            ? [{
                s3Key: zipKeyFromState,
                ...(normalizedZipFolderUrl ? { url: normalizedZipFolderUrl } : {}),
                ...(zipSizeFromState ? { fileSize: zipSizeFromState } : {}),
                ...(zipMimeTypeFromState ? { mimeType: zipMimeTypeFromState } : {}),
                ...(zipFileNameFromState ? { fileName: zipFileNameFromState } : {}),
            }]
            : [];

        if (!category) errors.push("Please select a category");
        if (!title || title.trim().length < 3) errors.push("Title must be at least 3 characters");
        if (!description || description.trim().length < 20) errors.push("Description must be at least 20 characters");
        if (!keywords || keywords.length < 5) errors.push("Add at least 5 keywords");
        if (!selectPlan) errors.push("Please select a plan");
        // Only require new image in create mode
        if (!imageUrl && !isEditing) errors.push("Please upload an image");
        if (isZipHidden && (zipKeyFromState || normalizedZipFolderUrl)) {
            errors.push("ZIP upload is not allowed for this category");
        }
        if (resolvedZipMode === ZIP_MODE_REQUIRED && !zipKeyFromState) {
            errors.push("Please upload a ZIP file for this category");
        }
        if ((zipKeyFromState || normalizedZipFolderUrl) && !zipKeyFromState) {
            errors.push("ZIP must be uploaded through secure S3 flow (missing zip s3Key)");
        }
        if (zipKeyFromState) {
            if (normalizedZipSourceName && !normalizedZipSourceName.toLowerCase().split('?')[0].endsWith('.zip')) {
                errors.push("ZIP upload must be a .zip file");
            }
            if (!zipSizeFromState || Number.isNaN(Number(zipSizeFromState))) {
                errors.push("ZIP fileSize is required");
            }
            if (!normalizedZipMimeType) {
                errors.push("ZIP mimeType is required");
            }
            if (zipSizeFromState) {
                if (Number.isFinite(zipMinSize) && zipSizeFromState < zipMinSize) {
                    errors.push(`ZIP too small. Minimum ${formatSizeHint(zipMinSize)} required`);
                }
                if (Number.isFinite(zipMaxSize) && zipSizeFromState > zipMaxSize) {
                    errors.push(`ZIP too large. Maximum ${formatSizeHint(zipMaxSize)} allowed`);
                }
            }
            if (normalizedZipMimeType && zipMimeAllowList.length && !zipMimeAllowList.includes(normalizedZipMimeType)) {
                errors.push(`ZIP type ${normalizedZipMimeType} is not allowed. Allowed formats: ${zipMimeAllowList.join(', ')}`);
            }
        }
        if (!termsChecked) errors.push("Please accept Terms and Conditions");
        if (!contentChecked) errors.push("Please confirm permission letter condition");

        const lastIndex = s3Keys.length ? s3Keys.length - 1 : -1;
        const meta = lastIndex >= 0 ? fileMetadata[lastIndex] : null;
        // Only require file metadata in create mode
        if (!meta && !isEditing) errors.push("Missing file metadata, re-upload the file");
        if (meta && uploadPolicy) {
            const normalizedMime = String(meta.mimeType || '').trim().toLowerCase();
            const policyMimeAllowList = Array.isArray(uploadPolicy.allowedMimeTypes)
                ? uploadPolicy.allowedMimeTypes
                : [];
            const fileSize = Number(meta.fileSize || 0);
            const minSize = uploadPolicy.minFileSizeBytes !== null && uploadPolicy.minFileSizeBytes !== undefined
                ? Number(uploadPolicy.minFileSizeBytes)
                : null;
            const maxSize = uploadPolicy.maxFileSizeBytes !== null && uploadPolicy.maxFileSizeBytes !== undefined
                ? Number(uploadPolicy.maxFileSizeBytes)
                : null;
            if (policyMimeAllowList.length && !policyMimeAllowList.includes(normalizedMime)) {
                errors.push(
                    `This category allows only: ${policyMimeAllowList.join(', ')}`
                );
            }
            if (Number.isFinite(minSize) && fileSize > 0 && fileSize < minSize) {
                errors.push(`File is smaller than category minimum size (${minSize} bytes).`);
            }
            if (Number.isFinite(maxSize) && fileSize > 0 && fileSize > maxSize) {
                errors.push(`File exceeds category maximum size (${maxSize} bytes).`);
            }
        }

        if (errors.length) {
            message.error(errors[0]);
            return;
        }

        setLoading(true);
        try {
            const uploadPayload = {
                imagesize: imageSize,
                imagetype: imageType,
                imageUrl: imageUrl,
                s3Key: s3Keys[lastIndex] || null,
                s3Url: s3Urls[lastIndex] || null,
                fileMetadata: meta || null,
                creatorId: creatorData?._id,
                category: category || null,
                subcategory: selectedSubCategory || null,
                subsubcategory: selectedSubSubCategory || null,
                title: title,
                description: description,
                keywords: keywords,
                freePremium: normalizedPlan,
                expireimagedate: expireDate,
                zipfolder: normalizedZipFolder,
                zipfolderurl: normalizedZipFolderUrl || '',
                termsConditions: termsChecked,
                permissionLetter: contentChecked,
                imageData: imageData
            };
            let response;
            if (isEditing && editId) {
                // PATCH existing asset
                response = await api.patch(`/images/${editId}`, uploadPayload);
            } else {
                // CREATE new asset
                response = await api.post(API_ENDPOINTS.SAVE_IMAGES, uploadPayload);
            }

            if (response.data.status === 200) {
                message.success(isEditing ? 'Asset updated successfully' : 'Picture upload successful');
                resetForm();
                navigate('/dashboard');
            } else {
                message.error(response.data.message || 'Upload failed, please try again.');
            }
        } catch (error) {
            const apiErrors = error?.response?.data?.errors;
            if (apiErrors && Array.isArray(apiErrors)) {
                message.error('Validation errors: ' + apiErrors.join(', '));
            } else {
                const apiMessage = error?.response?.data?.message || error.message;
                message.error(apiMessage || 'An error occurred while uploading. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCategory('');
        setDescription('');
        setImageSize('');
        setImageUrl('');
        setImageType('');
        setSelectPlan('');
        setSelectedSubCategory('');
        setSelectedSubSubCategory('');
        setTitle('');
        setZipFolder([]);
        setZipFolderUrl('');
        setTermsChecked(false);
        setContentChecked(false);
        setKeywords([])
    };

    return (
        <button
            type="button"
            className="btn btn-primary w-100 py-3 fw-semibold mt-3"
            onClick={handleUpload}
            disabled={!termsChecked || !contentChecked}
        >
            {loading ? <Spin /> : (isEditing ? 'Save changes' : 'Upload')}
        </button>
    );
}

UploadBtn.propTypes = {
    isZipRequired: PropTypes.bool,
    uploadPolicy: PropTypes.shape({
        sourceName: PropTypes.string,
        allowedMimeTypes: PropTypes.arrayOf(PropTypes.string),
        minFileSizeBytes: PropTypes.number,
        maxFileSizeBytes: PropTypes.number,
    }),
    zipPolicy: PropTypes.shape({
        sourceName: PropTypes.string,
        zipMode: PropTypes.string,
        allowedMimeTypes: PropTypes.arrayOf(PropTypes.string),
        minFileSizeBytes: PropTypes.number,
        maxFileSizeBytes: PropTypes.number,
    }),
};

export default UploadBtn;
