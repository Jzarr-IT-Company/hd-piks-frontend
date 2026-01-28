import React from 'react'
import logo from '../../assets/logo1.webp'
function SecondNavbar() {
  return (
    <>
      <div className="container py-3">
        <div className="row">
          <div className="col-12">
            <div className="">
              <img src={logo} className='img-fluid' style={{width:180}} alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SecondNavbar