import React, { useEffect, useState } from 'react';
import img2 from '../../assets/user.png';
import axios from 'axios';
import { getUserById } from '../../Services/user.js';
import DownloadButton from '../DownloadButton/DownloadButton';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import MoreRelatedVideos from '../MoreRelatedVideos/MoreRelatedVideos';
function MoreRelatedVideosBaner1({ closeButton, imageId, userId }) {
    const [imagesData, setImagesData] = useState([]);
    const [userData, setUserData] = useState(null);
    const [imageDetails, setImageDetails] = useState({
        imageUrlOnly: '',
        imageUrl: '',
        freeOrPremium: '',
        category: '',
        imageUrlSep: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            try {
                const response = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
                const image = response.data.data.find((item) => item._id === imageId);
                if (image) {
                    setImagesData([image]);
                    setImageDetails({
                        freeOrPremium: image.freePremium,
                        imageUrlOnly: image.imageData?.[0]?.url || '',
                        imagekey: image.imageData?.[0]?.key || '',
                        category: image.category,
                        imageUrlSep: image.imageUrl
                    });
                }
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUser = async () => {
            setLoading(true);
            try {
                const user = await getUserById(userId);
                setUserData(user || {});
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
        fetchUser();
    }, [imageId, userId]);

    return (
        <div className="container">
            <div className="row">
                <div className="col-12 d-flex justify-content-end">
                    <button onClick={closeButton} className='btn border-none'>
                        <i className="fa-solid fa-xmark fs-4"></i>
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-12 py-4 ps-4">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            
                            <img src={userData?.profileImage || img2} className="img-fluid"
                                style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "contain" }} alt="Profile" />
                            <Link to={`/memberdetail/${userData?._id}`}>
                                <h5 className='ms-3'>{userData?.name || "Unknown User"}</h5>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mt-3 px-3">
                <div className="col-lg-7 col-md-12 col-sm-12 border" style={{ height: "400px" }}>
                    {imagesData.map((img) => (
                        <video key={img._id} src={img.imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} controls  muted loop autoPlay></video>
                    )) || <Spin />}
                </div>
                <div className="col-12 mt-4 px-3 py-3 d-flex align-items-center justify-content-between">
                    <p><i className="fa-solid fa-circle-check"></i> {imageDetails.freeOrPremium === "Free" ? "Free to use" : imageDetails.freeOrPremium === "Premium" ? "Premium" : ""}</p>
                    <div className="d-none d-md-flex align-items-center" style={{ gap: "20px" }}>
                        <button className='btn border px-4 fw-semibold py-3 fs-6'>
                            <i className="fa-regular fa-heart"></i> Like
                        </button>
                        <DownloadButton fileKey={imageDetails.imageUrl} imageUrlOnly={imageDetails.imageUrlOnly} />
                        <button className="fw-semibold btn border px-3 py-3" style={{ fontSize: "18px" }}>
                            <i className="fa-solid fa-circle-info"></i> More info
                        </button>
                        <button className="fw-semibold btn border px-3 py-3" style={{ fontSize: "18px" }}>
                            <i className="fa-solid fa-share-nodes"></i> Share
                        </button>
                        <button className="fw-semibold btn border px-3 py-3" style={{ fontSize: "18px" }}>
                            <i className="fa-regular fa-flag"></i> Report
                        </button>
                    </div>
                </div>
            </div>
            <div className="row d-md-none">
                <div className="col-12">
                    <button className='btn border fw-semibold' style={{ fontSize: "11px" }}>
                        <i className="fa-regular fa-heart"></i> Like
                    </button>
                    <button className="fw-semibold btn border" style={{ fontSize: "11px" }}>
                        <i className="fa-solid fa-circle-info"></i> More info
                    </button>
                    <button className="fw-semibold btn border" style={{ fontSize: "11px" }}>
                        <i className="fa-solid fa-share-nodes"></i> Share
                    </button>
                    <button className="fw-semibold btn border" style={{ fontSize: "11px" }}>
                        <i className="fa-regular fa-flag"></i> Report
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-12 d-md-none" style={{ height: "420px" }}>

                </div>
            </div>
            <MoreRelatedVideos category={imageDetails.category} />
            <div className="sticky-bottom w-100 bg-white py-3 d-md-none px-0">
                <DownloadButton fileKey={imageDetails.imageUrl} imageUrlOnly={imageDetails.imageUrlOnly} imgeUrlSep={imageDetails.imageUrlSep} />
            </div>
        </div>
    );
}

export default MoreRelatedVideosBaner1