import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useGlobalState } from '../../Context/Context';
import api from '../../Services/api.js';
import { API_ENDPOINTS } from '../../config/api.config.js';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

function UploadBtn() {
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
    const [loading, setLoading] = useState(false)

    const id = Cookies.get('id');
    const navigate = useNavigate();

    const handleUpload = async () => {
        // Check if editing
        const editAsset = sessionStorage.getItem('editAsset');
        const isEditing = !!editAsset;
        const editId = isEditing ? JSON.parse(editAsset)._id : null;
        const normalizedPlan = selectPlan ? selectPlan.toLowerCase() : null;
        const errors = []

        if (!category) errors.push("Please select a category");
        if (!title || title.trim().length < 3) errors.push("Title must be at least 3 characters");
        if (!description || description.trim().length < 20) errors.push("Description must be at least 20 characters");
        if (!keywords || keywords.length < 5) errors.push("Add at least 5 keywords");
        if (!selectPlan) errors.push("Please select a plan");
        if (!imageUrl) errors.push("Please upload an image");
        if (!termsChecked) errors.push("Please accept Terms and Conditions");
        if (!contentChecked) errors.push("Please confirm permission letter condition");

        const lastIndex = s3Keys.length ? s3Keys.length - 1 : -1;
        const meta = lastIndex >= 0 ? fileMetadata[lastIndex] : null;
        if (!meta) errors.push("Missing file metadata, re-upload the file");

        if (errors.length) {
            message.error(errors[0]);
            return;
        }

        setLoading(true);
        try {
            // Log the payload for debugging
            // category, subcategory, subsubcategory are now ObjectIds (from dynamic selection)
            const uploadPayload = {
                imagesize: imageSize,
                imagetype: imageType,
                imageUrl: imageUrl,
                s3Key: s3Keys[lastIndex] || null,
                s3Url: s3Urls[lastIndex] || null,
                fileMetadata: meta,
                creatorId: creatorData?._id,
                category: category || null,
                subcategory: selectedSubCategory || null,
                subsubcategory: selectedSubSubCategory || null,
                title: title,
                description: description,
                keywords: keywords,
                freePremium: normalizedPlan,
                expireimagedate: expireDate,
                zipfolder: zipFolder,
                zipfolderurl: zipFolderUrl,
                termsConditions: termsChecked,
                permissionLetter: contentChecked,
                imageData: imageData
            };
            console.log('UPLOAD PAYLOAD:', uploadPayload);
            let response;
            if (isEditing && editId) {
                response = await api.patch(`/images/${editId}`, uploadPayload);
            } else {
                response = await api.post(API_ENDPOINTS.SAVE_IMAGES, uploadPayload);
            }
            if (response.data.status === 200) {
                message.success(isEditing ? 'Asset updated successfully' : 'Picture upload successful');
                sessionStorage.removeItem('editAsset');
                resetForm();
                navigate('/dashboard');
            } else {
                message.error(response.data.message || 'Upload failed, please try again.');
            }
        } catch (error) {
            // Log full backend error response for debugging
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
        setZipFolder('');
        setTermsChecked(false);
        setContentChecked(false);
        setKeywords([])
    };

    return (
        <>
            <button
                type="button"
                className="btn btn-primary w-100 py-3 fw-semibold mt-3"
                onClick={handleUpload}
                disabled={!termsChecked || !contentChecked}
            >
                {loading ? <Spin /> : "Upload"}
            </button>
        </>
    );
}

export default UploadBtn;
