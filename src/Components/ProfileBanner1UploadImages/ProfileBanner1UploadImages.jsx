import React, { useState } from 'react';
import img1 from '../../assets/user.png';
import axios from 'axios';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import ImgCrop from 'antd-img-crop';
import { useGlobalState } from '../../Context/Context';

function ProfileBanner1UploadImages() {
    const {profileImage, setprofileImage}=useGlobalState()
    const [loading, setLoading] = useState(false); 
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            // 1. Get presigned URL from backend
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

            // 3. Persist S3 URL in user model
            await api.post(API_ENDPOINTS.SAVE_PROFILE_IMAGE_URL, {
                s3Url,
                s3Key,
                fileSize: file.size,
                mimeType: file.type
            });

            // 4. Set profile image to S3 URL in context
            setprofileImage(s3Url);
        } catch (error) {
            console.error('Error uploading image to S3 or saving URL:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <ImgCrop rotationSlider>
        <div className="d-flex justify-content-center">
            <input type="file" className="d-none" id="image" onChange={handleImageUpload} />
            <label htmlFor="image" className="border d-flex justify-content-center align-items-center" style={{ width: "160px", height: "160px", borderRadius: "50%", position: "relative" }}>
                {loading ? (
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                ) : (
                    <img
                        src={profileImage || img1} // Display the uploaded image if available, otherwise display the default image
                        className="img-fluid"
                        style={{ objectFit: "cover", width: "100%", height: "100%",borderRadius:"50%" }}
                        alt="User"
                    />
                )}
            </label>
        </div>
        </ImgCrop>
        </>
    );
}

export default ProfileBanner1UploadImages;
