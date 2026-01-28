import React, { useEffect, useState } from 'react'
import img2 from '../../assets/user.png';
import { Link, useParams } from 'react-router-dom';
import LikeBttn from '../LikeBttn/LikeBttn';
import DownloadButton from '../DownloadButton/DownloadButton';
import ShareButton from '../ShareButton/ShareButton';
import MoreRelatedImages from '../MoreRelatedImages/MoreRelatedImages';
import axios from 'axios';
import { getUserById } from '../../Services/user.js';
import MoreInfoCompo from '../MoreInfoCompo/MoreInfoCompo';
import { Skeleton } from 'antd';
import BackBtnCompo from '../BackBtnCompo/BackBtnCompo';

function DetailImagePageBanner1() {
    const { id, userId } = useParams();
    const [imagesData, setImagesData] = useState([]);
    const [userData, setUserData] = useState(null);
    const [imageUrl, setImageDetails] = useState();

    useEffect(() => {
        const fetchImage = async () => {
            try {
                // Use a dedicated endpoint for single image fetch if available, else fallback
                let image = null;
                if (API_ENDPOINTS.GET_IMAGE_BY_ID) {
                    const response = await api.get(API_ENDPOINTS.GET_IMAGE_BY_ID(id));
                    image = response.data.data;
                } else {
                    // fallback: fetch all and filter
                    const response = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
                    image = response.data.data.find((item) => item._id === id);
                }
                if (image) {
                    setImagesData([image]);
                    setImageDetails(image.imageUrl); // Always use imageUrl for main image
                }
            } catch (error) {
                console.error("Error fetching images:", error);
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

        fetchImage();
        fetchUser();
    }, [id, userId]);

    return (
        <>
            <div className="container my-5 py-5">
                <BackBtnCompo />
                <div className="row">
                    <div className="col-12 py-4 ps-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <img src={userData?.profileImage || img2} className="img-fluid"
                                    style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "contain" }} alt="Profile" />
                                <Link to={`/memberdetail/${userData?._id}`}>
                                    <h5 className='ms-3'>{userData ? userData.name : "Unknown User"}</h5>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row py-4">
                    <div className="col-md-7 col-sm-12" style={{ height: "450px" }}>
                        {imagesData?.length > 0 ? (
                            <img
                                src={imageUrl}
                                className="img-fluid w-100"
                                style={{ height: "450px", objectFit: "contain" }}
                                alt=""
                            />
                        ) : (
                            <Skeleton.Image
                                style={{ height: "450px", width: "100%", objectFit: "contain" }}
                                className='img-fluid w-100'
                                active
                            />
                        )}
                    </div>
                    <div className="col-md-5 d-none d-md-block">
                        <div className="" style={{ height: "400px" }}></div>
                    </div>
                </div>
                <div className="row mt-4 d-none d-md-block">
                    <div className="col-md-12 col-sm-12 d-flex justify-content-between align-items-center">
                        <div className="text-capitalize fw-semibold fs-5">use for free</div>
                        <div className="d-flex align-items-center justify-content-between align-items-center" style={{ gap: "0px 10px" }}>
                            {
                                imagesData.map((img) => {
                                    return <LikeBttn imgId={img._id} />
                                })
                            }
                            <DownloadButton imageUrl={imageUrl} />
                            <ShareButton data={imagesData} id={imagesData} userdata={userData} />
                            <MoreInfoCompo imagesData={imagesData} userData={userData} />
                            <button className="fw-semibold btn border d-none d-md-block py-3" style={{ fontSize: "17px" }}>
                                <i className="fa-regular fa-flag"></i> Report
                            </button>
                            <button className="fw-semibold btn border d-block d-md-none">
                                <i className="fa-regular fa-flag"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row mt-4 d-block d-md-none">
                    <div className="col-md-12 col-sm-12 d-flex justify-content-between align-items-center">
                        <div className="text-capitalize fw-semibold">use for free</div>
                    </div>
                    <div className="col-12 mt-4">
                        <div className="d-flex align-items-center justify-content-center align-items-center" style={{ gap: "0px 10px" }}>
                            <LikeBttn />
                            <ShareButton data={imagesData} id={imagesData} userdata={userData} />
                            <MoreInfoCompo imagesData={imagesData} userData={userData} />
                            <button className="fw-semibold btn border d-none d-md-block" style={{ fontSize: "12px" }}>
                                <i className="fa-regular fa-flag"></i> Report
                            </button>
                            <button className="fw-semibold btn border d-block d-md-none" style={{ fontSize: "17px" }}>
                                <i className="fa-regular fa-flag"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row d-block d-md-none" style={{ height: "450px" }}></div>
                <div className="row">
                    {/* Pass correct category for related images, fallback to first image's category */}
                    <MoreRelatedImages category={imagesData[0]?.category} />
                </div>
                <div className="sticky-bottom w-100 bg-white py-3 d-md-none px-0" >
                    <DownloadButton imageUrl={imageUrl} />
                </div>
            </div>
        </>
    )
}

export default DetailImagePageBanner1