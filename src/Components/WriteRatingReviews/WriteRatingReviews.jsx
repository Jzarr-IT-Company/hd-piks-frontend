import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import './WriteRatingReviews.css'


const labels = {
    0.5: 'Useless',
    1: 'Useless+',
    1.5: 'Poor',
    2: 'Poor+',
    2.5: 'Ok',
    3: 'Ok+',
    3.5: 'Good',
    4: 'Good+',
    4.5: 'Excellent',
    5: 'Excellent+',
};

function getLabelText(value) {
    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}



function WriteRatingReviews() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [value, setValue] = React.useState(0);
    const [hover, setHover] = React.useState(-1);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    return (
        <>
            <Button className="customized-css" onClick={showModal}>
                Write Reviews
            </Button>
            <Modal title="Wrtie Own Reviews" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div className="">
                    <div className="">
                        <p className='text-center fw-semibold fs-5'>Give me rating</p>
                        <div className="d-flex justify-content-center align-items-center">
                            <Box sx={{ width: 200, display: 'flex', alignItems: 'center' }}>
                                <Rating
                                    name="hover-feedback"
                                    value={value}
                                    precision={0.5}
                                    getLabelText={getLabelText}
                                    onChange={(event, newValue) => {
                                        setValue(newValue);
                                    }}
                                    onChangeActive={(event, newHover) => {
                                        setHover(newHover);
                                    }}
                                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                />
                                {value !== null && (
                                    <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
                                )}
                            </Box>
                        </div>
                    </div>
                    <div className="">
                        <p className='fw-semibold'>Reviews Title</p>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="floatingInput"
                                placeholder="name@example.com"
                            />
                            <label htmlFor="floatingInput">Reviews Title</label>
                        </div>

                    </div>
                    <div className="">
                        <p className='fw-semibold'>Reviews </p>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="floatingInput"
                                placeholder="name@example.com"
                            />
                            <label htmlFor="floatingInput">Reviews </label>
                        </div>

                    </div>
                    <div className="">
                        <p className='fw-semibold'>Name for display</p>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="floatingInput"
                                placeholder="name@example.com"
                            />
                            <label htmlFor="floatingInput">Name for display</label>
                        </div>

                    </div>
                </div>
            </Modal>
        </>
    );
}

export default WriteRatingReviews