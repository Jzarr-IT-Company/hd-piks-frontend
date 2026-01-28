import React, { useState } from 'react';
import { Spin } from 'antd';
function DownloadMockupsPsdFolders({ zipfolderurl }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        const zipfoldermodifiedUrl2 = zipfolderurl?.replace('https://imagesvideoszipfilesbuckets.s3.amazonaws.com/', '') || '';
        setIsLoading(true);
        const downloadKey = zipfoldermodifiedUrl2;
        if (!downloadKey) {
            alert('No valid file key or URL provided.');
            setIsLoading(false);
            return;
        }
        if (zipfolderurl || zipfoldermodifiedUrl2) {
            try {
                const link = document.createElement('a');
                link.href = zipfolderurl;
                link.setAttribute('download', zipfoldermodifiedUrl2);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(zipfolderurl);
            } catch (error) {
                console.error('Error downloading file:', error);
                alert('Error downloading file');
            } finally {
                setIsLoading(false);
            }
            return;
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