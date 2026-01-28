import React, { useState } from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import './DownloadButton.css'

const DownloadButton = ({ imageUrl }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        const modifiedUrl = imageUrl?.replace('https://imagesvideoszipfilesbuckets.s3.amazonaws.com/', '') || '';

        setIsLoading(true);
        const downloadKey = modifiedUrl;
        
        if (!downloadKey) {
            alert('No valid file key or URL provided.');
            setIsLoading(false);
            return;
        }
       
        const downloadUrl = `https://hspiks-image-server.vercel.app/download?key=${downloadKey}`;

        try {
            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', downloadKey);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Error downloading file');
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
