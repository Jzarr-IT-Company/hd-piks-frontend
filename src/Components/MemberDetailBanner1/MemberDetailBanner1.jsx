import React, { useEffect, useState } from 'react';
import Divider from '@mui/material/Divider';
import img2 from '../../assets/user2.png';
import img from '../../assets/member_back_image.jpeg';
import { Box } from '@mui/material';
import { Spin } from 'antd';

function MemberDetailBanner1({ filterationData }) {
    const [data, setData] = useState([])
    useEffect(() => {
        filterationData.map((elements) => {
            setData(elements)
        })
    }, [filterationData])
    if (!filterationData) {
        return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <Spin />
        </div>
    }
    return (
        <>
            <section className='pt-5 pb-3' style={{ position: 'relative', backgroundImage: `url(${img})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    zIndex: 1
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="row d-flex justify-content-center align-items-center mb-3">
                        <div className="col-md-6 col-sm-12 text-center">
                            <img src={data.profileImage || img2} className='img-fluid mb-3' style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: 'cover' }} alt="" />

                            <h1 className='mb-3 display-5 fw-semibold text-white'>{data.name}</h1>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-none d-md-flex align-items-center justify-content-center" style={{ gap: "0px 30px" }}>
                                    <div className='text-center'>
                                        <p className='mb-0 fw-semibold fs-5'><i className="text-white fa fa-eye"></i></p>
                                        <p className='mt-0 text-white fs-6'>1.1M</p>
                                    </div>
                                    <div>
                                        <Box sx={{ height: '43px', display: 'flex', alignItems: 'center' }}>
                                            <Divider orientation="vertical" variant="middle" flexItem />
                                        </Box>
                                    </div>
                                    <div className='text-center'>
                                        <p className='mb-0 fw-semibold fs-5'><i className="text-white fa fa-user-plus"></i></p>
                                        <p className='mt-0 text-white fs-6'>1.1M</p>
                                    </div>
                                    <div>
                                        <Box sx={{ height: '43px', display: 'flex', alignItems: 'center' }}>
                                            <Divider orientation="vertical" variant="middle" flexItem />
                                        </Box>
                                    </div>
                                    <div className='text-center'>
                                        <p className='mb-0 fw-semibold fs-5'><i className="text-white fa fa-user-friends"></i></p>
                                        <p className='mt-0 text-white fs-6'>1.1M</p>
                                    </div>
                                </div>
                                <div className='d-none d-md-block'>
                                    <button className='btn btn-purple fw-semibold px-4 text-white w-100 py-3 rounded-5 ' style={{ background: "linear-gradient(90deg, rgba(85, 36, 163, 1) 0%, rgba(163, 85, 217, 1) 100%)" }}>Follow us</button>
                                </div>
                                <div className='d-md-none d-flex w-100'>
                                    <button className='btn btn-purple fw-semibold px-4 text-white w-100 py-3 rounded-5 ' style={{ background: "linear-gradient(90deg, rgba(85, 36, 163, 1) 0%, rgba(163, 85, 217, 1) 100%)" }}>Follow us</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default MemberDetailBanner1;
