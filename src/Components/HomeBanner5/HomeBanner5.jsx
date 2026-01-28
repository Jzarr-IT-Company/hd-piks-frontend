import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './HomeBanner5.css';

function HomeBanner5() {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const id = Cookies.get('id');
    const token = Cookies.get('token');
    const handle = () => {
        if (!id && !token) {
            return  navigate('/login')
        }
        navigate('/dashboard')
        window.scroll(0, 0)
    }
    return (
        <div className="container py-5 my-4">
            <h3 className='text-center mb-4 display-5 fw-bold'>Unlock Your Creativity</h3>
            <p className='text-center mb-5'>Every stock image tells a story crafted by a talented creator. Join Freepik&apos;s vibrant community <br /> of creators and start monetizing your unique content today!</p>
            <div className="d-flex justify-content-center align-items-center mb-5">
                <button className='button' onClick={handle}>Sell Content</button>
            </div>
            <div className="row scroll-container" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} >
                <div className={` col-12 scroll-images ${isHovered ? 'paused' : ''}`}>
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_urssmb.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_t2iq4z.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_yjmjpl.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_nfki1f.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_zelwgk.jpg"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_mcumc2.jpg"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_urssmb.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_t2iq4z.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_yjmjpl.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_nfki1f.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_zelwgk.jpg"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_mcumc2.jpg"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_urssmb.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_t2iq4z.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_yjmjpl.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_nfki1f.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_zelwgk.jpg"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_mcumc2.jpg"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_urssmb.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_t2iq4z.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_yjmjpl.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_nfki1f.png"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_zelwgk.jpg"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                    <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730807724/file_mcumc2.jpg"} className='img-fluid' style={{ cursor: "pointer" }} alt="" />
                </div>
            </div>
        </div>
    );
}

export default HomeBanner5;

