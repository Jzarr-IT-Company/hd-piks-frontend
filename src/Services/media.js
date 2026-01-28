import api from './api';

// Upload a file to S3 using presigned URL flow and return the S3 URL
export const uploadMedia = async (file) => {
  // 1. Request presigned URL from backend
  const presignRes = await api.post('/getPresignedUploadUrl', {
    fileName: file.name,
    fileType: file.type
  });
  const { presignedUrl, s3Url } = presignRes.data.data;

  // 2. Upload file directly to S3
  await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });

  // 3. Return the S3 file URL
  return s3Url;
};
