import React, { useEffect, useState, useMemo } from 'react';
import img2 from '../../assets/user.png';
import Modal from 'react-bootstrap/Modal';
import MoreRelatedImagesBaner1 from '../MoreRelatedImagesBaner1/MoreRelatedImagesBaner1';
import axios from 'axios';
import { getAllUsers } from '../../Services/user.js';
import { Skeleton } from 'antd';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

function SearchFilterationImagesCompo({name}) {
    const [show, setShow] = useState(false);
    const [allData, setAllData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`${API_ENDPOINTS.SEARCH_IMAGES}?searchQuery=${name}`)
            const [imagesResponse, users] = await Promise.all([
                api.get(`${API_ENDPOINTS.SEARCH_IMAGES}?searchQuery=${name}`),
                getAllUsers()
            ]);
            setUsersData(users);
            const filteredImages = imagesResponse.data.data.filter(item => item.category === name || item.subcategory === name || item.subsubcategory === name);
           console.log(imagesResponse.data.data)
            setAllData(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [name]);

    const findUser = useMemo(() => (userId) => {
        return usersData.find(user => user._id === userId) || { name: "Unknown User", profileImage: img2 };
    }, [usersData]);

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

    const getColumns = useMemo(() => {
        if (window.innerWidth < 567) return 2;
        if (window.innerWidth < 900) return 3;
        return 4;
    }, [window.innerWidth]);

    if (loading) {
        return (
            <div className="container py-5 my-5">
                <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={getColumns} gap={8}>
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
                        <h5 className='fw-semibold'>No Result Found <span className='fw-bold'>"{name}"</span></h5>
                    </div>
                ) : (
                    <ImageList sx={{ width: '100%', height: 'auto' }} variant="masonry" cols={getColumns} gap={8}>
                        {allData.map((item, index) => {
                            const user = findUser(item.userId);
                            return (
                                <ImageListItem key={item._id} onClick={() => handleImageClick(item._id, item.userId)}>
                                    <div className="card card-container rounded-4" onClick={() => handleImageClick(item._id, item.userId)}>
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
            </div>
            <Modal show={show} fullscreen={"fullscreen"} onHide={closeButton}>
                <MoreRelatedImagesBaner1 closeButton={closeButton} imageId={selectedImageId} userId={selectedUserId} />
            </Modal>
        </>
    );
}

export default SearchFilterationImagesCompo