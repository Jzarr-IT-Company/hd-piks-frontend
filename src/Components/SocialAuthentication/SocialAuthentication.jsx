import React from 'react'
import img1 from '../../assets/google2.png'
import img2 from '../../assets/facebook2.png'


function SocialAuthentication() {
  return (
    <>
        <div className="">
            <div className="">
                <button className='w-100 py-2 btn btn-light fw-semibold'><span><img src={img1} className='img-fluid me-4' width={30} alt="" /></span> Google</button>
            </div>
            <div className="mt-3">
                <button className='w-100 py-2 btn btn-light fw-semibold'><span><img src={img2} className='img-fluid me-4' width={40} alt="" /></span>Facebook</button>
            </div>
        </div>
    </>
  )
}

export default SocialAuthentication