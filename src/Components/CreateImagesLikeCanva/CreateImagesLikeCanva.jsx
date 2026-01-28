import React from 'react'
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
function CreateImagesLikeCanva() {
    const id = Cookies.get('id');
    const token = Cookies.get('token');
    return (
        <>
            <div className="d-none d-md-block">
                {
                    id && token ?
                        (
                            <>
                                <Link className='btn btn-outline-light me-3' style={{ fontSize: "14px" }} target='_blank' to={'https://design.hdpiks.com/'}>Start Creating</Link>
                                <Link className='text-white' to={'/pricing'}>Pricing</Link>
                            </>
                        ) : <Link className='text-white' style={{ fontSize: "18px" }} to={'/pricing'}>Pricing</Link>
                }
            </div>
        </>
    )
}

export default CreateImagesLikeCanva