import { ImageList, ImageListItem } from '@mui/material';
import { Skeleton } from 'antd';
import axios from 'axios';
import { getAllUsers } from '../../Services/user.js';
import Modal from 'react-bootstrap/Modal';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import MoreRelatedImagesBaner1 from '../MoreRelatedImagesBaner1/MoreRelatedImagesBaner1';
import MoreRelatedMockupsCompo from '../MoreRelatedMockupsCompo/MoreRelatedMockupsCompo';

function MockupsCompo({ categoryname }) {
    const [show, setShow] = useState(false);
    const [fullscreen, setFullscreen] = useState(true);
    const [allData, setAllData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState(4);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [imagesResponse, users] = await Promise.all([
                api.get(API_ENDPOINTS.GET_ALL_IMAGES),
                getAllUsers()
            ]);
            const filteredData = await imagesResponse.data.data.filter(items => items.category=='mockups')
            console.log(filteredData)
            setUsersData(users);
            setAllData(filteredData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [categoryname]);

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 567) {
                setColumns(2);
            } else if (window.innerWidth < 900) {
                setColumns(3);
            } else {
                setColumns(4);
            }
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    const findUser = (userId) => {
        return usersData.find(user => user._id === userId) || { name: "Unknown User", profileImage: img2 };
    };

    const handleImageClick = (imageId, userId) => {
        setSelectedImageId(imageId);
        setSelectedUserId(userId);
        setShow(true);
    };

    const closeButton = () => {
        setShow(false);
        setSelectedImageId(null);
        setSelectedUserId(null);
    };

    const navigate = useNavigate();
    const HandleBtnn = () => {
        navigate(`/collection/${categoryname}`);
    };

    if (loading) {
        return (
            <div className="container py-5">
                <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={columns} gap={8}>
                    {Array.from(new Array(200)).map((_, index) => (
                        <ImageListItem key={index}>
                            <Skeleton.Image style={{ width: '100%', height: 200, borderRadius: 8 }} active />
                        </ImageListItem>
                    ))}
                </ImageList>
            </div>
        );
    }
    return (
        <>
        <div className="container py-5">
                {allData.length === 0 ? (
                    <div className="text-center mt-5">
                        <h5>No Data Found</h5>
                    </div>
                ) : (
                    <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={columns} gap={8}>
                        {allData.slice(0, 160).map((item) => {
                            const user = findUser(item.userId);
                            return (
                                <ImageListItem key={item._id} onClick={() => handleImageClick(item._id, item.userId)}>
                                    <div className="card card-container rounded-4">
                                        <img
                                            src={item.imageUrl}
                                            alt="..."
                                            className="card-img rounded-4 img-fluid"
                                            loading="lazy"
                                            style={{ borderRadius: '8px' }}
                                        />
                                        <div className="card-img-overlay rounded-4 content-hide d-flex flex-column justify-content-end border-danger">
                                            <h5 className="mb-2 text-white fw-semibold" style={{ fontSize: "15px" }}>
                                                {item.subcategory || item.category || item.subsubcategory}
                                            </h5>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <img
                                                        src={user.profileImage}
                                                        className="rounded-circle me-2"
                                                        alt="Profile Pic"
                                                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
                                                    />
                                                    <p className="mb-0 me-2 text-white" style={{ fontSize: "14px" }}>{user.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ImageListItem>
                            );
                        })}
                    </ImageList>
                )}
                <div className="d-flex justify-content-center mt-3">
                    <button className="button px-5 py-3" onClick={HandleBtnn}>View More</button>
                </div>
            </div>
            <Modal show={show} fullscreen={fullscreen} onHide={closeButton}>
                <MoreRelatedMockupsCompo closeButton={closeButton} imageId={selectedImageId} userId={selectedUserId} />
            </Modal>
        </>
    )
}

export default MockupsCompo