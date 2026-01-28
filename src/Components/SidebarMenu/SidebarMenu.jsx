import React from 'react'
import { useGlobalState } from '../../Context/Context';
import { ArrowDownUp, BadgeCheck, Sparkles, Palette, Tags, CalendarClock, FileCode } from 'lucide-react';

function SidebarMenu({handleSidebarClose}) {
    const {  setCloseSidebar } = useGlobalState();

    const closeHandle = () => {
        handleSidebarClose(); // This will toggle sidebar visibility
        setCloseSidebar(true);
    };
    return (
        <>
            <div
                className="bg-white px-2"
            >
                <h5 className="d-flex justify-content-between align-items-center mb-4">
                <span className="fs-4 fw-semibold">Filter</span>
                <button
                        className="btn-close"
                        aria-label="Close"
                        style={{ fontSize: '1.2rem', lineHeight: 1 }}
                        onClick={closeHandle}  
                    />
                </h5>
                <div id="filterContent">
                    <div className="mb-3">
                        <h5 className="d-flex align-items-center mb-3">
                            <ArrowDownUp size={16} className="me-2" />
                            Sort by
                        </h5>
                        <div className="d-flex justify-content-start mb-3">
                            <div className="me-2">
                                <button type="button" className="btn btn-outline-secondary">
                                    Popular
                                </button>
                            </div>
                            <div>
                                <button type="button" className="btn btn-outline-secondary">
                                    Recent
                                </button>
                            </div>
                        </div>
                        <h5 className="mt-4 d-flex align-items-center gap-2">
                            <BadgeCheck size={16} />
                            License
                        </h5>
                        <div className="d-flex justify-content-start mb-3">
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
                        <h5 className="mt-4 d-flex align-items-center gap-2">
                            <Sparkles size={16} />
                            Art
                        </h5>
                        <div className="d-flex justify-content-start mb-3">
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
                        <h5 className="mb-3 d-flex align-items-center mt-4">
                            <Palette size={16} className="me-2" />
                            Colors
                        </h5>
                        <div className="d-flex flex-wrap">
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
                        <h5 className="mb-3 d-flex align-items-center mt-4">
                            <CalendarClock size={16} className="me-2" />
                            Publish Date
                        </h5>
                        <div className="d-flex mb-4">
                            <button className="btn btn-outline-secondary me-2">
                                Last 3 months
                            </button>
                            <button className="btn btn-outline-secondary">Last 6 months</button>
                        </div>
                        <div className="mb-3">
                            <button className="btn btn-outline-secondary">Last year</button>
                        </div>
                        <h5 className="mb-3 d-flex align-items-center">
                            <Tags size={16} className="me-2" />
                            Tags
                        </h5>
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
                        <h5 className="mb-3 d-flex align-items-center">
                            <FileCode size={16} className="me-2" />
                            Extensions
                        </h5>
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
                        <div className="row">
                            <div className="col-12">
                                <button className='btn btn-purple text-white w-100 py-3' style={{background: "linear-gradient(90deg, rgba(85, 36, 163, 1) 0%, rgba(163,85, 217, 1) 100%)"}}>Apply Filters</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SidebarMenu