import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Empty, Image, Spin } from 'antd';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import './DashboardBanner.css';
import EditImagesCompo from '../EditImagesCompo/EditImagesCompo';

import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

function DashboardBanner3({ items, loadingExternal, refreshExternal }) {
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCollectionsData, setTotalCollectionsData] = useState(0)
    const id = Cookies.get('id');

    useEffect(() => {
        if (items) {
            setAllData(items);
            setTotalCollectionsData(items.length);
            setLoading(loadingExternal ?? false);
            return;
        }

        (async () => {
            try {
                const response = await api.post(API_ENDPOINTS.GET_USER_IMAGES, { id });
                if (response.data.status === 200) {
                    setTotalCollectionsData(response.data.data.length)
                    setAllData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, [items, loadingExternal, id]);

    const refresh = async () => {
        if (refreshExternal) return refreshExternal();
        try {
            const response = await api.post(API_ENDPOINTS.GET_USER_IMAGES, { id });
            if (response.data.status === 200) {
                setTotalCollectionsData(response.data.data.length)
                setAllData(response.data.data);

            }
        } catch (error) {
            setLoading(false);
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex align-items-center" style={{ gap: "0px 30px" }}>

                            <button className='btn btn-dark'>Gallery ({totalCollectionsData})</button>
                            <button className='btn btn-dark'>Collection</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mt-3">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                        <Spin />
                    </div>
                ) : allData.length === 0 ? (
                    <div className="text-center d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                        <Empty className="custom-empty" description={<span style={{ fontWeight: "bold", fontSize: "1.3rem" }}>No Data Found</span>} />
                    </div>
                ) : (
                    <ImageList
                        sx={{ width: "100%", height: "auto", justifyContent: 'center' }}
                        variant="masonry"
                        cols={4}
                    >
                        {allData.map((item, index) => {
                            const isImage = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'].includes(item.imagetype);
                            const isVideo = item.imagetype === 'video/mp4';
                            // console.log(item)
                            return (
                                <ImageListItem key={index} cols={1} className="image-item">
                                    <div className="image-overlay">
                                        {isImage ? (
                                            <Image
                                                src={`${item.imageUrl}?w=248&fit=crop&auto=format`}
                                                alt="Image"
                                                loading="lazy"
                                                className="responsive-image"
                                            />
                                        ) : isVideo ? (
                                            <video src={item.imageUrl} controls className="responsive-image" />
                                        ) : null}
                                        <EditImagesCompo item={item} refresh={refresh} />
                                    </div>
                                </ImageListItem>
                            );
                        })}
                    </ImageList>
                )}
            </div>
        </>
    );
}

export default DashboardBanner3;


