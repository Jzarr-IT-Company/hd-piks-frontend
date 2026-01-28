import React from 'react'
import logo from '../../assets/logo1.webp'
import { Link } from 'react-router-dom'

function ImagsNavbar() {

    return (
        <>
            <div className="py-2  px-3 container-fluid fixed-top bg-light shadow-sm top-bar row align-items-center justify-content-between">
                <div className="col-md-auto col-sm-12">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-block d-md-none">
                            <button className='btn' style={{backgroundColor:"transparent"}}>
                                <i className="fa-solid fa-bars-staggered"></i>
                            </button>
                        </div>
                        <Link to={'/'}>
                        <img
                            src={logo}
                            alt="Logo"
                            className="img-fluid"
                            style={{ maxHeight: 30 }}
                        />
                        </Link>
                        <div className="d-block d-md-none">
                            <button className='btn border-none' style={{border:'none'}}>
                                <i className="fa-solid fa-arrow-up-wide-short fs-5"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col d-none d-md-block">
                    <div
                        className="input-group"
                        style={{ backgroundColor: "#f8f9fa", height: 50 }}
                    >
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            aria-label="Search"
                            style={{ height: "100%", padding: 10 }}
                        />
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            style={{ height: "100%" }}
                        >
                            <i className="bi bi-search" />
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default ImagsNavbar