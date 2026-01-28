import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import { ImageList, ImageListItem } from '@mui/material';
import { FiCompass, FiDownload, FiFolderPlus, FiShare2 } from 'react-icons/fi';
import PropTypes from 'prop-types';
import api from '../../Services/api';
import { getAllUsers } from '../../Services/user.js';
import '../FilterationImages/FilterationImages.css';

function VideoCompo({ categoryname }) {
    const [allData, setAllData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchImages = async () => {
            try {
                setLoading(true);
                const response = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
                const raw = response.data?.data || [];
                const filtered = raw.filter(
                    (item) => item.approved === true && item.rejected !== true && (item.category || '').toLowerCase() === categoryname.toLowerCase()
                );
                filtered.sort((a, b) => new Date(b.createdAt || b.fileMetadata?.uploadedAt || 0) - new Date(a.createdAt || a.fileMetadata?.uploadedAt || 0));
                setAllData(filtered);
            } catch (error) {
                console.error('Error fetching images:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            try {
                const users = await getAllUsers();
                setUsersData(users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchImages();
        fetchUsers();
    }, [categoryname]);

    const handleImageClick = (imageId) => {
        navigate(`/asset/${imageId}`);
    };

    const handleDiscoverSimilar = (event, item) => {
        event.stopPropagation();
        if (!item?.category) return;
        navigate(`/collection/${(item.category || '').toLowerCase()}`);
    };

    const handleShare = async (event, item) => {
        event.stopPropagation();
        const detailUrl = item?._id
            ? `${window.location.origin}/asset/${item._id}`
            : item?.imageUrl || window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: item?.title || 'Asset', url: detailUrl });
                return;
            }
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(detailUrl);
                alert('Link copied to clipboard');
                return;
            }
            window.prompt('Copy link', detailUrl);
        } catch (err) {
            console.error('Share failed', err);
        }
    };

    const handleDownload = (event, item) => {
        event.stopPropagation();
        if (!item?.imageUrl) return;
        const link = document.createElement('a');
        link.href = item.imageUrl;
        link.download = item.title || 'asset';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleSaveToCollection = (event) => {
        event.stopPropagation();
        alert('Save to collection coming soon.');
    };

    const getColumns = useMemo(() => {
        if (window.innerWidth < 567) return 2;
        if (window.innerWidth < 900) return 3;
        return 4;
    }, [window.innerWidth]);

    return (
        <>
            <div className="container py-5">
                <div className="row g-3">
                    {loading ? (
                        [...Array(8)].map((_, index) => (
                            <div className="col-6 col-md-3 mb-2" key={index}>
                                <Skeleton.Image active style={{ width: "100%", height: "200px" }} />
                                <Skeleton active title={false} paragraph={{ rows: 1 }} />
                            </div>
                        ))
                    ) : allData.length > 0 ? (
                        <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={getColumns} gap={8}>
                            {allData.slice(0, 30).map((item) => {
                                const user = usersData.find(user => user._id === item.userId);
                                return (
                                    <ImageListItem key={item._id} onClick={() => handleImageClick(item._id)}>
                                        <div className="card card-container rounded-4" onClick={() => handleImageClick(item._id)}>
                                            <div className="video-wrapper">
                                                <video
                                                    src={item.imageUrl}
                                                    muted
                                                    onMouseEnter={(e) => e.target.play()}
                                                    onMouseLeave={(e) => e.target.pause()}
                                                    loop
                                                    playsInline
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="card-img-overlay rounded-4 content-hide d-flex flex-column justify-content-end">
                                                <div className="filteration-actions">
                                                    <button
                                                        type="button"
                                                        className="filteration-action-btn"
                                                        title="Discover similar"
                                                        onClick={(e) => handleDiscoverSimilar(e, item)}
                                                    >
                                                        <FiCompass size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="filteration-action-btn"
                                                        title="Save to collection"
                                                        onClick={handleSaveToCollection}
                                                    >
                                                        <FiFolderPlus size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="filteration-action-btn"
                                                        title="Share"
                                                        onClick={(e) => handleShare(e, item)}
                                                    >
                                                        <FiShare2 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="filteration-action-btn"
                                                        title="Download"
                                                        onClick={(e) => handleDownload(e, item)}
                                                    >
                                                        <FiDownload size={16} />
                                                    </button>
                                                </div>
                                                <h5 className="mb-2 text-white fw-semibold" style={{ fontSize: "15px" }}>
                                                    {item.subcategory || item.category || item.subsubcategory}
                                                </h5>
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <img
                                                            src={user?.profileImage}
                                                            className="rounded-circle me-2"
                                                            alt="Profile Pic"
                                                            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
                                                        />
                                                        <p className="mb-0 me-2 text-white" style={{ fontSize: "14px" }}>{user?.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ImageListItem>
                                );
                            })}
                        </ImageList>

                    ) : (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: "30vh" }}>
                            <p>No data found</p>
                        </div>
                    )}
                </div>
                {allData.length > 0 && !loading && (
                    <div className="d-flex justify-content-center mt-3">
                        <button className="button px-5 py-3">
                            View More
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

// Add PropTypes validation for the categoryname prop
VideoCompo.propTypes = {
    categoryname: PropTypes.string.isRequired, // Ensure categoryname is a required string
};

export default VideoCompo;
