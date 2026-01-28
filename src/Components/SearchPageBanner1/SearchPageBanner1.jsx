import React, { useEffect, useState } from 'react';
import './SearchPageBanner1.css';
import { useParams } from 'react-router-dom';
import ImagsNavbar from '../ImagsNavbar/ImagsNavbar';
import FilterationComponent from '../FilterationComponent/FilterationComponent';
import VideoCompo from '../VideoCompo/VideoCompo';
import SearchFilterationImagesCompo from '../SearchFilterationImagesCompo/SearchFilterationImagesCompo';

function SearchPageBanner1() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [categoryname, setCategoryName] = useState('');
    const { name } = useParams();
    useEffect(() => {
        setCategoryName(name)
    }, [name])
    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };
    const handleCategoryChange = (category) => {
        console.log(category)
        setCategoryName(`${name} ${category}`);
    };
    return (
        <>
            <div className="">
                <ImagsNavbar />
            </div>
            <div className="">
                <div className="wrapper">
                    <aside id="sidebar" className={`${isExpanded ? "expand" : ""} d-none d-md-block border-end`}>
                        <div className="d-flex justify-content-between align-items-center ps-3 pt-2">
                            <div className="sidebar-logo">
                                <p className='text-dark fw-smeibold fs-5'>Filtered</p>
                            </div>
                            <button className="toggle-btn" type="button" onClick={toggleSidebar}>
                                {isExpanded ? (
                                    <i className="fa-solid fa-xmark text-dark"></i>
                                ) : (
                                    <div className="d-flex justify-contente-center">
                                        <i className="lni lni-grid-alt text-dark"></i>
                                    </div>
                                )}
                            </button>
                        </div>
                        {/* <div className=""style={{ overflow: "auto", height: "90vh", scrollbarWidth: 'none' }}> */}
                        <ul className="sidebar-nav pt-0 mt-0 pb-5" style={{ overflow: "auto", height: "90vh", scrollbarWidth: 'none' }}>
                            <li className="sidebar-item py-2">
                                <a href="#" className="sidebar-link text-dark fs-5 fw-semibold">
                                    <i className="fas fa-sort me-2" style={{ fontSize: "1rem" }} />
                                    <span className='fs-6 text-capitalize'>Asset type
                                    </span>
                                </a>
                                <div className="sidebar-link d-flex flex-wrap justify-content-start mb-3 px-3" style={{ gap: "10px 10px" }}>
                                    <div className="me-2 ">
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            Vectors
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            Photos
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            Icons
                                        </button>
                                    </div>
                                    <div className="me-2 ">
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            Videos
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            PSD
                                        </button>
                                    </div>
                                    <div className="me-2 ">
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            Templates
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            Mockups
                                        </button>
                                    </div>
                                </div>
                            </li>
                            <li className="sidebar-item py-2">
                                <a href="#" className="sidebar-link text-dark fs-5 fw-semibold">
                                    <i className="fas fa-sort me-2" style={{ fontSize: "1rem" }} />
                                    <span className='fs-6 text-capitalize'>Sort by</span>
                                </a>
                                <div className="sidebar-link d-flex justify-content-start mb-3 px-3">
                                    <div className="me-2 ">
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            Popular
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="sidebar-link btn btn-outline-secondary">
                                            Recent
                                        </button>
                                    </div>
                                </div>
                            </li>
                            <li className="sidebar-item py-2">
                                <a href="#" className="sidebar-link text-dark fs-5 fw-semibold">
                                    <i className="lni lni-agenda" />
                                    <span>License</span>
                                </a>
                                <div className="sidebar-link d-flex justify-content-start mb-3 px-3">
                                    <div className="me-2">
                                        <button type="button" className="btn btn-outline-secondary">
                                            Free
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="btn btn-outline-secondary">
                                            Premium
                                        </button>
                                    </div>
                                </div>
                            </li>
                            <li className="sidebar-item py-2">
                                <a href="#" className="sidebar-link collapsed text-dark fs-5 fw-semibold has-dropdown" data-bs-toggle="collapse" data-bs-target="#auth" aria-expanded="false" aria-controls="auth">
                                    <i className="lni lni-protection" />
                                    <span>Art</span>
                                </a>
                                <div className="sidebar-link d-flex justify-content-start mb-3 px-3">
                                    <div className="me-2">
                                        <button type="button" className="btn btn-outline-secondary">
                                            2D
                                        </button>
                                    </div>
                                    <div>
                                        <button type="button" className="btn btn-outline-secondary">
                                            3D
                                        </button>
                                    </div>
                                </div>
                            </li>
                            <li className="sidebar-item py-2">
                                <a href="#" className="sidebar-link collapsed text-dark fs-5 fw-semibold has-dropdown" data-bs-toggle="collapse" data-bs-target="#multi" aria-expanded="false" aria-controls="multi">
                                    <i className="fas fa-paint-brush me-2" style={{ fontSize: "1.2rem" }} />
                                    <span>Colors</span>
                                </a>
                                <div className="sidebar-link d-flex flex-wrap px-3">
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#FF5733" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#FFBD33" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#FF33A1" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#33FF57" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#33FFF8" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#33B5FF" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#3357FF" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#9B59B6" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#F1C40F" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#E74C3C" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#2ECC71" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#3498DB" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#1ABC9C" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#D35400" }}
                                    />
                                    <div
                                        className="rounded-circle me-3 mb-2"
                                        style={{ width: 20, height: 20, backgroundColor: "#8E44AD" }}
                                    />
                                </div>
                            </li>
                            <li className="sidebar-item  py-2">
                                <a href="#" className="sidebar-link text-dark fs-5 fw-semibold pb-4">
                                    <i className="fas fa-tag me-2" style={{ fontSize: "1.2rem" }} />
                                    <span>Tags</span>
                                </a>
                                <div className="sidebar-link d-flex flex-wrap px-3">
                                    <div className="row mb-4">
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">All</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">Number</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">Digit</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">Numeral</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">Single</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">Solo</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">Unity</button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className="sidebar-item py-2">
                                <a href="#" className="sidebar-link text-dark fs-5 fw-semibold py-3">
                                    <i className="fas fa-file-code me-2" style={{ fontSize: "1.2rem" }} />
                                    <span>Extensions</span>
                                </a>
                                <div className="sidebar-link d-flex flex-wrap px-3">
                                    <div className="row mb-4">
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">All</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">MP4</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">3GP</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">PNG</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">JPG</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">JPEG</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">SVG</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">WEBP</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">EPS</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">AI</button>
                                        </div>
                                        <div className="col-6 mb-2">
                                            <button className="btn btn-outline-secondary w-100">PSD</button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        {/* </div> */}
                    </aside>
                    <div className="main pt-3 mt-4 mb-5" style={{ height: "100vh", width: "100%", overflow: "auto" }} >
                        <div className="" style={{ height: "150vh" }}>
                            <FilterationComponent changeCategory={handleCategoryChange} />
                            <h2 className='fw-semibold mt-4'>
                                Results for "<span className='fw-bold'>{name}</span>"
                            </h2>
                            {
                                categoryname == 'video' ?
                                    <VideoCompo categoryname={categoryname} />
                                    : <SearchFilterationImagesCompo name={categoryname} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SearchPageBanner1