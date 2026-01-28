import React from 'react'
import { Link } from 'react-router-dom'

function SidebarCompo() {
    return (
        <>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                    <Link class="nav-link fw-semibold text-white active" style={{ fontSize: "14px" }} to={'/'}>Home</Link>
                </li>
                <li className="nav-item dropdown">
                    <a
                        className="nav-link fw-semibold text-white dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ fontSize: "14px" }}
                    >
                        Explore
                    </a>
                    <ul className="dropdown-menu" style={{ width: "16vw" }}>
                        <div className="row py-3">
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/member`}>Members</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Artificial Chirstmas Trees"}`}>collections</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Premium"}`}>Premium</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ul>
                </li>
                <li className="nav-item dropdown">
                    <a
                        className="nav-link fw-semibold text-white dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ fontSize: "14px" }}
                    >
                        Images
                    </a>
                    <ul className="dropdown-menu" style={{ width: "70vw" }}>
                        <div className="row py-3 ">
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-3">
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Vector"}`}>Vector</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Photos"}`}>Photos</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"AI Images"}`}>AI Images</Link>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="row">
                                            <div className="col-4">
                                                <div className="">
                                                    <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Illustrations"}`}>Illustrations</Link>
                                                </div>
                                                <div className="">
                                                    <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Backgrounds"}`}>Backgrounds</Link>
                                                </div>
                                                <div className="">
                                                    <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Textures"}`}>Textures</Link>
                                                </div>
                                                <div className="">
                                                    <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Patterns"}`}>Patterns </Link>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="">
                                                    <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Cartoons"}`}>Cartoons</Link>
                                                </div>
                                                <div className="">
                                                    <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Clip art"}`}>Clip art</Link>
                                                </div>
                                                <div className="">
                                                    <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Symbols and signs"}`}>Symbols and signs</Link>
                                                </div>
                                                <div className="">
                                                    <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Silhouettes"}`}>Silhouettes </Link>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <img src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732776227/1732776220302-306176920_hk6qcb.webp"} className='img-fluid rounded w-100' alt="" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ul>
                </li>
                <li className="nav-item dropdown">
                    <a
                        className="nav-link fw-semibold text-white dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ fontSize: "14px" }}
                    >
                        Videos
                    </a>
                    <ul className="dropdown-menu" style={{ width: "50vw" }}>
                        <div className="row py-3 px-3">
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-6">
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Backgrounds and others"}`}>Backgrounds and others</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Nature"}`}>Nature</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Travel and places"}`}>Travel and places</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Business and technology"}`}>Business and technology</Link>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"People and emotions"}`}>People and emotions</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Events"}`}>Events</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Food and drinks"}`}>Food and drinks</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Sports"}`}>Sports</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ul>
                </li>
                <li className="nav-item dropdown">
                    <a
                        className="nav-link fw-semibold text-white dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ fontSize: "14px" }}
                    >
                        PSD
                    </a>
                    <ul className="dropdown-menu" style={{ width: "60vw" }}>
                        <div className="row py-3 px-3">
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Stationery"}`}>Stationery</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Social media"}`}>Social media</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Greeting cards"}`}>Greeting cards</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Flyers"}`}>Flyers</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Logos"}`}>Logos</Link>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Business cards"}`}>Business cards</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Posters"}`}>Posters</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Invitation cards"}`}>Invitation cards</Link>
                                        </div>
                                        <div className="">
                                            <Link style={{ fontSize: "13px" }} className='btn text-decoration-none text-dark fw-semibold py-2 text-start hover_link w-100' to={`/collection/${"Banners"}`}>Banners</Link>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <img src={"https://res.cloudinary.com/ds819uy6o/image/upload/v1730803633/file_wzjssh.png"} className='img-fluid w-100 rounded' alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ul>
                </li>
                <li className="nav-item">
                    <Link class="nav-link fw-semibold text-white active" style={{ fontSize: "14px" }} to={`/collection/Ai images`}>AI images</Link>
                </li>
                <li className="nav-item">
                    <Link class="nav-link fw-semibold text-white active" style={{ fontSize: "14px" }} to={`/collection/Icon`}>Icon</Link>
                </li>
                <li className="nav-item">
                    <Link class="nav-link fw-semibold text-white active" style={{ fontSize: "14px" }} to={`/collection/Templates`}>Templates</Link>
                </li>
                <li className="nav-item">
                    <Link class="nav-link fw-semibold text-white active" style={{ fontSize: "14px" }} to={`/collection/Mockups`}>Mockups</Link>
                </li>
                <li className="nav-item">
                    <Link class="nav-link fw-semibold text-white active" style={{ fontSize: "14px" }} to={'/blog'}>Blogs</Link>
                </li>
            </ul>
        </>
    )
}

export default SidebarCompo