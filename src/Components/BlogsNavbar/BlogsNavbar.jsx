import React from 'react'
import logo from '../../../public/logo.png'
import { useNavigate } from 'react-router-dom'
function BlogsNavbar() {
    const navigate = useNavigate()
    const handleBttn=()=>{
        navigate('/')
    }
        return (
        <>
            <div className='border py-3 px-4'>
                <div className="d-flex align-items-center" onClick={handleBttn} style={{cursor:"pointer"}}>
                    <img src={logo} alt="" />
                    <span className='fw-semibold fs-4 ms-2'>Blogs</span>
                </div>
            </div>
        </>
    )
}

export default BlogsNavbar