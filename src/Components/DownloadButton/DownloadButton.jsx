import React, { useState } from 'react';
import { Spin } from 'antd';
import API_BASE_URL from '../../config/api.config.js';
import { trackAssetDownloadEvent } from '../../utils/downloadTracking.js';
import './DownloadButton.css'

const DownloadButton = ({ imageUrl, fileKey, imageUrlOnly, imgeUrlSep, assetId, fileName }) => {
    const [isLoading, setIsLoading] = useState(false);

    const getS3KeyFromUrl = (url) => {
        if (!url) return '';
        try {
            const parsed = new URL(url);
            return decodeURIComponent((parsed.pathname || '').replace(/^\/+/, ''));
        } catch {
            return '';
        }
    };

    const getExtensionFromUrl = (url) => {
        if (!url) return '';
        try {
            const parsed = new URL(url);
            const pathname = parsed.pathname || '';
            const dotIndex = pathname.lastIndexOf('.');
            return dotIndex === -1 ? '' : pathname.slice(dotIndex);
        } catch {
            const dotIndex = url.lastIndexOf('.');
            return dotIndex === -1 ? '' : url.slice(dotIndex);
        }
    };

    const handleDownload = async () => {
        const sourceUrl = imageUrl || fileKey || imageUrlOnly || imgeUrlSep || '';
        const extractedKey = getS3KeyFromUrl(sourceUrl);
        const normalizedKey = extractedKey || sourceUrl?.replace('https://imagesvideoszipfilesbuckets.s3.amazonaws.com/', '') || '';

        setIsLoading(true);
        const downloadKey = normalizedKey;
        
        if (!downloadKey && !sourceUrl) {
            alert('No valid file key or URL provided.');
            setIsLoading(false);
            return;
        }

        try {
            const nameFromKey = downloadKey ? (downloadKey.split('/').pop() || 'asset') : 'asset';
            const ext = getExtensionFromUrl(sourceUrl);
            const fallbackName = fileName || (nameFromKey.includes('.') ? nameFromKey : `${nameFromKey}${ext || ''}`);

            let href = sourceUrl;
            const tracked = await trackAssetDownloadEvent({ assetId, fileName: fallbackName });
            if (tracked?.downloadUrl) {
                href = tracked.downloadUrl;
            } else if (downloadKey) {
                const params = new URLSearchParams();
                params.set('key', downloadKey);
                params.set('filename', fallbackName);
                href = `${API_BASE_URL}/download?${params.toString()}`;
            }

            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', fallbackName);
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert(error?.message || 'Error downloading file');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <button className='fw-semibold d-none d-md-block btn btn-primary border py-3' style={{fontSize:"17px"}} onClick={handleDownload} disabled={isLoading}>
            {isLoading ?<Spin className="white-spin" /> : (<><i className="fa-solid fa-download"></i> Download File</>)}
        </button>
        <button className='fw-semibold d-md-none w-100 btn btn-primary border py-3' onClick={handleDownload} disabled={isLoading}>
            {isLoading ?<Spin className="white-spin" /> : (<><i className="fa-solid fa-download me-2"></i> Download File</>)}
        </button>
        </>
    );
};

export default DownloadButton;
