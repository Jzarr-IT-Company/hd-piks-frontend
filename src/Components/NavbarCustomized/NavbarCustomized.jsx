import React from 'react'
import logo from '../../assets/logo1.webp'

function NavbarCustomized() {
  return (
    <>
        <div className="container-fluid border py-3">
            <div className="row">
                <div className="col-12 d-flex justify-content-between">
                    <div className="">
                        <img src={logo} width={180} alt="" />
                    </div>
                    <div className="d-flex" style={{gap:"0px 10px"}}>
                        <button className='btn btn-light'>Upload</button>
                        <button className='btn btn-light'>Login</button>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default NavbarCustomized