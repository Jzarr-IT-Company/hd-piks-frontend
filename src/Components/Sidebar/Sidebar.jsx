import React, { useEffect, useState } from 'react';
import ImagsNavbar from '../ImagsNavbar/ImagsNavbar';
import FilterationComponent from '../FilterationComponent/FilterationComponent';
import FilterationImages from '../FilterationImages/FilterationImages';
import { useParams } from 'react-router-dom';
import VideoCompo from '../VideoCompo/VideoCompo';
import { Layers, ArrowDownUp, BadgeCheck, Sparkles, Palette, Tags, Grid, X } from 'lucide-react';
import './Sidebar.css';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [categoryname, setCategoryName] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [presetSubcategory, setPresetSubcategory] = useState('all');
    const { name } = useParams();
    useEffect(() => {
        setCategoryName(name)
        setPresetSubcategory('all');
    }, [name])

    useEffect(() => {
        const fetchSubs = async () => {
            try {
                const res = await api.get(API_ENDPOINTS.GET_ALL_IMAGES_RAW);
                const raw = res.data?.data || [];
                const approved = raw.filter((item) => item.approved === true && item.rejected !== true);
                const filtered = approved.filter((item) => (item.category || '').toLowerCase() === (name || '').toLowerCase());
                const uniqueSubs = Array.from(new Set(filtered.map((item) => item.subcategory).filter(Boolean)));
                setSubcategories(uniqueSubs);
            } catch (err) {
                console.error('Failed to load subcategories', err.message);
                setSubcategories([]);
            }
        };
        if (name) {
            fetchSubs();
        }
    }, [name]);
    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };
    const handleCategoryChange = (category) => {
        setCategoryName(category);
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
                            <button className="toggle-btn d-flex align-items-center justify-content-center" type="button" onClick={toggleSidebar}>
                                {isExpanded ? (
                                    <X size={18} className="text-dark" />
                                ) : (
                                    <Grid size={18} className="text-dark" />
                                )}
                            </button>
                        </div>
                        <ul className="sidebar-nav pt-0 mt-0 pb-5" style={{ overflow: "auto", height: "90vh", scrollbarWidth: 'none' }}>
                            <li className="sidebar-item py-2">
                                <a href="#" className="sidebar-link text-dark fs-5 fw-semibold">
                                    <Layers size={16} className="me-2" />
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
                                    <ArrowDownUp size={16} className="me-2" />
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
                                    <BadgeCheck size={16} className="me-2" />
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
                                    <Sparkles size={16} className="me-2" />
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
                                    <Palette size={16} className="me-2" />
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
                                    <Tags size={16} className="me-2" />
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
                    </aside>
                    <div className="main pt-3 mt-4 mb-5" style={{ height: "80vh", width: "100%", overflow: "auto" }} >
                        <div className="" style={{ height: "150vh" }}>
                            <FilterationComponent
                                changeCategory={handleCategoryChange}
                                subcategories={subcategories}
                                onSelectSubcategory={(sub) => setPresetSubcategory(sub)}
                                categoryname={categoryname}
                            />
                            <h2 className='fw-semibold mt-4'>
                                Results for "<span className='fw-bold'>{name}</span>"
                            </h2>
                            <FilterationImages name={categoryname} presetSubcategory={presetSubcategory} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sidebar;