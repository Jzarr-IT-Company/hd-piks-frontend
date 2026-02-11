import React, { useState } from 'react';
import { useGlobalState } from '../../Context/Context';
import api from '../../Services/api.js';
import { API_ENDPOINTS } from '../../config/api.config.js';
import { message, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

function UploadBtn({ isZipRequired = false }) {
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
        creatorData,
        // S3 fields
        s3Keys,
        s3Urls,
        fileMetadata
    } = useGlobalState();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    const isEditing = !!editId;

    const handleUpload = async () => {
        const normalizedPlan = selectPlan ? selectPlan.toLowerCase() : null;
        const errors = [];

        const zipKeyFromState = Array.isArray(zipFolder)
            ? (typeof zipFolder[0] === 'string'
                ? zipFolder[0]
                : (zipFolder[0]?.s3Key || zipFolder[0]?.key || ''))
            : (typeof zipFolder === 'string'
                ? zipFolder
                : (zipFolder?.s3Key || zipFolder?.key || ''));

        const normalizedZipFolderUrl = typeof zipFolderUrl === 'string'
            ? zipFolderUrl
            : (Array.isArray(zipFolder) ? (zipFolder[0]?.url || '') : (zipFolder?.url || ''));

        const normalizedZipFolder = zipKeyFromState
            ? [{ s3Key: zipKeyFromState, url: normalizedZipFolderUrl || null }]
            : [];

        if (!category) errors.push("Please select a category");
        if (!title || title.trim().length < 3) errors.push("Title must be at least 3 characters");
        if (!description || description.trim().length < 20) errors.push("Description must be at least 20 characters");
        if (!keywords || keywords.length < 5) errors.push("Add at least 5 keywords");
        if (!selectPlan) errors.push("Please select a plan");
        // Only require new image in create mode
        if (!imageUrl && !isEditing) errors.push("Please upload an image");
        if (isZipRequired && !zipKeyFromState && !normalizedZipFolderUrl) {
            errors.push("Please upload a ZIP file for this category");
        }
        if (!termsChecked) errors.push("Please accept Terms and Conditions");
        if (!contentChecked) errors.push("Please confirm permission letter condition");

        const lastIndex = s3Keys.length ? s3Keys.length - 1 : -1;
        const meta = lastIndex >= 0 ? fileMetadata[lastIndex] : null;
        // Only require file metadata in create mode
        if (!meta && !isEditing) errors.push("Missing file metadata, re-upload the file");

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
            console.log('UPLOAD PAYLOAD:', uploadPayload);

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
            console.log('UPLOAD ERROR RESPONSE:', error?.response?.data);
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

export default UploadBtn;
