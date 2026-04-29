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
                                <Link className='text-white pricing-link' to={'/pricing'}>Pricing</Link>
                                <Link className='btn start-creating-btn' to={'/design-hdpiks'}>Start Creating</Link>
                            </>
                        ) : <Link className='text-white pricing-link' to={'/pricing'}>Pricing</Link>
                }
            </div>
        </>
    )
}

export default CreateImagesLikeCanva
