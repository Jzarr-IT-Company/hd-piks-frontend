import React, { useState } from 'react';
import { useGlobalState } from '../../Context/Context';
import { uploadImageToS3, formatFileSize } from '../../Services/S3Service.js';
import { message } from 'antd';

function UploadBanner1ImageCompo() {
    const { 
        category,
        selectedSubCategory,
        selectedSubSubCategory,
        setImageSize, 
        setImageType, 
        setImageUrl, 
        setImageData,
        setS3Keys,
        setS3Urls,
        setFileMetadata,
        setUploadProgress
    } = useGlobalState();
    
    const [selectedImages, setSelectedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "video/mp4", "image/webp"];
    const MAX_IMAGE_BYTES = 30 * 1024 * 1024; // 30MB limit for images
    const MAX_VIDEO_BYTES = 120 * 1024 * 1024; // 120MB limit for videos
    
    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);

        if (!category) {
            return message.error('Please select a category before uploading.');
        }

        // Reset previous upload state so new files don't reuse old S3 keys/metadata
        setSelectedImages([]);
        setS3Keys([]);
        setS3Urls([]);
        setFileMetadata([]);
        setImageData([]);
        setImageUrl('');
        
        for (let file of files) {
            if (!allowedFileTypes.includes(file.type)) {
                message.error("Invalid file type. Only PNG, JPG, JPEG, GIF, WEBP and MP4 are allowed.");
                return;
            }

            const isVideo = file.type.startsWith('video/');
            const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
            if (file.size > limit) {
                message.error(`File too large. Max ${isVideo ? '120MB' : '30MB'} allowed.`);
                return;
            }

            // Clean filename
            const updatedFileName = file.name.replace(/\s+/g, '_');
            const updatedFile = new File([file], updatedFileName, { type: file.type });
            
            // Set basic file info
            setImageSize(formatFileSize(updatedFile.size));
            setImageType(updatedFile.type);
            setIsLoading(true);

            try {
                // Upload to S3 with progress tracking
                const onProgress = (percent) => {
                    setProgress(percent);
                    setUploadProgress(percent);
                };

                const s3Result = await uploadImageToS3(
                    updatedFile,
                    onProgress,
                    category,
                    selectedSubCategory,
                    selectedSubSubCategory
                );
                
                console.log("S3 Upload successful:", s3Result);

                // Update selected images preview
                setSelectedImages((prevImages) => [
                    ...prevImages,
                    {
                        file: updatedFile,
                        url: URL.createObjectURL(updatedFile),
                        s3Url: s3Result.s3Url,
                        s3Key: s3Result.s3Key
                    }
                ]);

                // Update global context with S3 data
                setImageUrl(s3Result.s3Url);
                setS3Keys((prev) => [...prev, s3Result.s3Key]);
                setS3Urls((prev) => [...prev, s3Result.s3Url]);
                
                setImageData((prev) => [...prev, {
                    url: s3Result.s3Url,
                    s3Key: s3Result.s3Key,
                    fileName: s3Result.fileName,
                    fileSize: s3Result.fileSize,
                    mimeType: s3Result.mimeType,
                    uploadedAt: s3Result.uploadedAt
                }]);

                setFileMetadata((prev) => [...prev, {
                    fileName: s3Result.fileName,
                    fileSize: s3Result.fileSize,
                    fileSizeFormatted: formatFileSize(s3Result.fileSize),
                    mimeType: s3Result.mimeType,
                    uploadedAt: s3Result.uploadedAt,
                    s3Key: s3Result.s3Key
                }]);

                message.success("Image uploaded successfully to S3!");
                
            } catch (error) {
                console.error("S3 Upload failed:", error);
                message.error("Image upload failed. Please try again.");
            } finally {
                setIsLoading(false);
                setProgress(0);
            }
        }
    };

    return (
        <div className="upload-dropzone">
            <input
                type="file"
                className="d-none"
                id="images"
                multiple
                onChange={handleFileChange}
            />
            <label
                htmlFor="images"
                style={{ width: '100%', height: '100%' }}
            >
                <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{ width: "100%", minHeight: "280px" }}
                >
                    {isLoading ? (
                        <div className="loading-spinner text-center">
                            <i className="fa fa-spinner fa-spin" style={{ fontSize: "42px" }}></i>
                            <p className="mt-2 mb-2">Uploading to S3... {progress}%</p>
                            <div style={{ width: '220px', height: '10px', background: '#ddd', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s' }}></div>
                            </div>
                        </div>
                    ) : selectedImages.length > 0 ? (
                        <>
                            <div className="main-image-preview" style={{ position: 'relative' }}>
                                {selectedImages[0].file.type.startsWith('video/') ? (
                                    <video
                                        src={selectedImages[0].url}
                                        controls
                                        style={{ maxHeight: '320px', maxWidth: '100%', borderRadius: '12px' }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <img
                                        src={selectedImages[0].url}
                                        alt="Selected"
                                        style={{ maxHeight: '320px', maxWidth: '100%', borderRadius: '12px' }}
                                    />
                                )}
                            </div>
                            {selectedImages.length > 1 && (
                                <div className="image-preview-grid mt-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {selectedImages.slice(1).map((image, index) => (
                                        <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                                            {image.file.type.startsWith('video/') ? (
                                                <video
                                                    src={image.url}
                                                    controls
                                                    style={{ maxHeight: '90px', maxWidth: '90px', borderRadius: '10px' }}
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <img
                                                    src={image.url}
                                                    alt={`Selected ${index + 1}`}
                                                    style={{ maxHeight: '90px', maxWidth: '90px', borderRadius: '10px' }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <i
                                className="fa-solid fa-cloud-arrow-up"
                                style={{ fontSize: "78px", color: '#2563eb' }}
                            ></i>
                            <h4 className="mt-3 mb-2" style={{ fontWeight: 800 }}>Drag & Drop to Upload</h4>
                            <p className="text-muted mb-1">or click to select files from your device</p>
                            <p className="small text-muted">Supported formats: JPG, PNG, JPEG, GIF, WEBP, MP4</p>
                        </div>
                    )}
                </div>
            </label>
        </div>
    );
}

export default UploadBanner1ImageCompo;
