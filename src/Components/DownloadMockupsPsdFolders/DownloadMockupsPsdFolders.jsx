import React, { useState } from 'react';
import { Spin } from 'antd';
import API_BASE_URL from '../../config/api.config.js';
import { trackAssetDownloadEvent } from '../../utils/downloadTracking.js';

function DownloadMockupsPsdFolders({ zipfolderurl, assetId, fileName }) {
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

    const handleDownload = async () => {
        const zipfoldermodifiedUrl2 = getS3KeyFromUrl(zipfolderurl)
            || zipfolderurl?.replace('https://imagesvideoszipfilesbuckets.s3.amazonaws.com/', '')
            || '';
        setIsLoading(true);
        const downloadKey = zipfoldermodifiedUrl2;
        if (!downloadKey) {
            alert('No valid file key or URL provided.');
            setIsLoading(false);
            return;
        }

        try {
            const fallbackName = fileName || (downloadKey.split('/').pop() || 'asset.zip');
            let href = zipfolderurl;

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
            <button className='fw-semibold d-none d-md-block btn btn-primary border px-3 py-3' onClick={handleDownload} disabled={isLoading}>
                {isLoading ? <Spin /> : (<><i className="fa-solid fa-download"></i> Download File</>)}
            </button>
            <button className='fw-semibold d-md-none w-100 btn btn-primary border px-3 py-3' onClick={handleDownload} disabled={isLoading}>
                {isLoading ? <Spin /> : (<><i className="fa-solid fa-download me-3"></i> Download File</>)}
            </button>
        </>
    );
}

export default DownloadMockupsPsdFolders
