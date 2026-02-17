import React, { useState } from 'react';
import img1 from '../../assets/user.png';
import axios from 'axios';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import ImgCrop from 'antd-img-crop';
import { message } from 'antd';
import { useAuth } from '../../Context/AuthContext';

function CreatorProfileImageUpload({ profileImage, setProfileImage }) {
    const [loading, setLoading] = useState(false);
    const { creatorData } = useAuth();
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            // 1. Get presigned URL from backend (reuse user endpoint for now, or use a dedicated one if available)
            const presignRes = await api.post(API_ENDPOINTS.GET_PRESIGNED_PROFILE_IMAGE_URL, {
                fileName: file.name,
                fileType: file.type
            });
            const { presignedUrl, s3Url, s3Key } = presignRes.data.data;

            // 2. Upload file directly to S3
            await axios.put(presignedUrl, file, {
                headers: {
                    'Content-Type': file.type
                }
            });

            // 3. Persist S3 URL in creator profile when creator record exists.
            // For first-time applicants, backend returns 404 ("creator profile not found");
            // we still keep S3 URL in local contributor form and submit it in apply payload.
            const creatorStatus = creatorData?.status || 'not-applied';
            const hasCreatorRecord = creatorStatus !== 'not-applied';
            if (hasCreatorRecord) {
                await api.post(API_ENDPOINTS.SAVE_CREATOR_PROFILE_IMAGE_URL, {
                    s3Url,
                    s3Key,
                    fileSize: file.size,
                    mimeType: file.type
                });
            }

            // 4. Set profile image to S3 URL in parent state (always)
            setProfileImage(s3Url);
            message.success('Profile image uploaded');
        } catch (error) {
            console.error('Error uploading image to S3 or saving URL:', error);
            const apiMessage = error?.response?.data?.message;
            message.error(apiMessage || 'Failed to upload profile image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <ImgCrop rotationSlider>
        <div className="d-flex justify-content-center">
            <input type="file" className="d-none" id="creator-image" onChange={handleImageUpload} />
            <label htmlFor="creator-image" className="border d-flex justify-content-center align-items-center" style={{ width: "160px", height: "160px", borderRadius: "50%", position: "relative" }}>
                {loading ? (
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                ) : (
                    <img
                        src={profileImage || img1}
                        className="img-fluid"
                        style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "50%" }}
                        alt="Creator"
                    />
                )}
            </label>
        </div>
        </ImgCrop>
        </>
    );
}

export default CreatorProfileImageUpload;
