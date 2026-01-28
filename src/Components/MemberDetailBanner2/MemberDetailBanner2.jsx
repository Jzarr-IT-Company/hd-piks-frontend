import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import axios from 'axios';
import { Image, Spin } from 'antd';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

function MemberDetailBanner2({ filterationData }) {
    const [age, setAge] = React.useState("Photos/Videos");
    const [selectedButton, setSelectedButton] = React.useState('gallery');
    const [id, setId] = React.useState('')
    const [allImagesData, setAllImageData] = React.useState([])
    const handleButtonClick = (button) => {
        setSelectedButton(button);
    };
    const handleChange = (event) => {
        setAge(event.target.value);
    };
    React.useEffect(() => {
        (async () => {
            filterationData.map((elements) => {
                setId(elements._id)
            })
            const response = await api.post(API_ENDPOINTS.GET_USER_IMAGES, { id });
            setAllImageData(response.data.data)
        })()
    }, [filterationData])
    if (!allImagesData) {
        return <div className="d-flex justiy-content-cenetr align-items-center">
            <Spin />
        </div>
    }
    return (
        <>
            <div className="container my-4">
                <div className="row">
                    <div className="col-12 mb-5 border-bottom pb-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
                        <div className="d-flex justify-content-between flex-wrap w-100">
                            <div className="button-group d-none d-md-flex mb-3 mb-md-0 ">
                                <button
                                    className={`btn py-3 butttons fw-semibold fs-5 px-5 rounded-5 ${selectedButton === 'gallery' ? 'active-btn btn-dark text-white' : 'btn-light btn-outline-dark border-2'}`}
                                    onClick={() => handleButtonClick('gallery')}
                                >
                                    Gallery
                                </button>
                                <button
                                    className={`btn py-3 butttons fw-semibold fs-5 px-5 rounded-5 ms-2 ${selectedButton === 'collection' ? 'active-btn btn-dark text-white' : 'btn-light btn-outline-dark border-2'}`}
                                    onClick={() => handleButtonClick('collection')}
                                >
                                    Collection
                                </button>
                            </div>
                            <div className="button-group d-flex d-md-none mb-3 mb-md-0 ">
                                <button
                                    className={`btn py-2 butttons fw-semibold fs-5 px-3 rounded-5 ${selectedButton === 'gallery' ? 'active-btn btn-dark text-white' : 'btn-light btn-outline-dark border-2'}`}
                                    onClick={() => handleButtonClick('gallery')}
                                >
                                    Gallery
                                </button>
                                <button
                                    className={`btn py-2 butttons fw-semibold fs-5 px-3 rounded-5 ms-2 ${selectedButton === 'collection' ? 'active-btn btn-dark text-white' : 'btn-light btn-outline-dark border-2'}`}
                                    onClick={() => handleButtonClick('collection')}
                                >
                                    Collection
                                </button>
                            </div>
                            <div className="select-menu">
                                <FormControl sx={{ m: 1, minWidth: 140 }}>
                                    <Select
                                        value={age}
                                        onChange={handleChange}
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Without label' }}
                                        className="select-box"
                                    >
                                        <MenuItem value={"Photos/Videos"}>Photos/Videos</MenuItem>
                                        <MenuItem value={"Photos"}>Photos</MenuItem>
                                        <MenuItem value={"Videos"}>Videos</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="">
                        <ImageList
                            sx={{ width: "100%", height: "auto", justifyContent: 'center' }}
                            variant="masonry"
                            cols={4}
                        >
                            {
                                allImagesData.map((data, index) => {
                                    const isImage = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'].includes(data.imagetype);
                                    const isVideo = data.imagetype === 'video/mp4';
                                    return (
                                        <>
                                            <ImageListItem key={index} cols={1} className="image-item">
                                                <div className="image-overlay">
                                                    {isImage ? (
                                                        <Image
                                                            src={`${data.imageUrl}?w=248&fit=crop&auto=format`}
                                                            alt="Image"
                                                            loading="lazy"
                                                            className="responsive-image"
                                                        />
                                                    ) : isVideo ? (
                                                        <video src={data.imageUrl} controls className="responsive-image" />
                                                    ) : null}
                                                    <div className="overlay-content d-flex justify-content-end align-items-end px-2 pb-3">
                                                        <button onClick={() => handleButtonClick(data)} className="overlay-button">View</button>
                                                    </div>
                                                </div>
                                            </ImageListItem>
                                        </>
                                    )
                                })
                            }
                        </ImageList>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MemberDetailBanner2;
