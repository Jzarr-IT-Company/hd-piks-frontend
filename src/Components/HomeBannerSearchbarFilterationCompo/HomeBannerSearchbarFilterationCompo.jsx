import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { useGlobalState } from '../../Context/Context';
import { useNavigate } from 'react-router-dom';

function HomeBannerSearchbarFilterationCompo() {
    const { homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration } = useGlobalState();
    const [searchQuerry, setSearchQuerry] = useState('');
    const [show, setShow] = useState(false);

    const handleToggle = (isOpen) => {
        setShow(isOpen);
    };
    const navigate = useNavigate()
    const handleSearchBttn = async () => {
        navigate(`/search/${searchQuerry}`)
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchBttn();
        }
    };

    return (
        <>
            <div className="container d-none d-md-block">
                <div className="row d-flex justify-content-center align-items-center">
                    <div className="col-sm-12 col-md-9">
                        <div className="mb-0 pb-5">
                            <div className="d-none d-md-flex d-lg-flex px-3 align-items-center rounded-3 my-3 w-100 py-2 bg-light">
                                <div className="w-25 d-none d-md-block">
                                    <Dropdown
                                        onMouseEnter={() => setShow(true)}
                                        onMouseLeave={() => setShow(false)}
                                        show={show}
                                        onToggle={handleToggle}
                                    >
                                        <Dropdown.Toggle className='py-3 text-uppercase fw-semibold' style={{ width: "100%", background: "linear-gradient(90deg, rgba(85, 36, 163, 1) 0%, rgba(163,85, 217, 1) 100%)", color: "white", border: "none", outline: "none" }} id="dropdown-basic">
                                            {homeBannerSearchbarFilteration}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu style={{ width: "18vw", scrollbarWidth: "none" }} >
                                            <Dropdown.Item onClick={() => { setHomeBannerSearchbarFilteration("Photos") }}>Photos</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setHomeBannerSearchbarFilteration("Videos") }}>Videos</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setHomeBannerSearchbarFilteration("Vector") }}>Vector</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setHomeBannerSearchbarFilteration("PSD") }}>PSD</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setHomeBannerSearchbarFilteration("Ai images") }}>Ai images</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setHomeBannerSearchbarFilteration("Templates") }}>Templates</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setHomeBannerSearchbarFilteration("Icons") }}>Icons</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setHomeBannerSearchbarFilteration("Mockups") }}>Mockups</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <input
                                    type="text"
                                    className='form-control py-3 border-none'
                                    placeholder={`Search ${homeBannerSearchbarFilteration}`}
                                    style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent" }}
                                    onKeyPress={handleKeyPress}
                                    onChange={(e) => setSearchQuerry(e.target.value)}
                                />
                                <button className='btn border-none' style={{ border: "none", outline: "none" }} onClick={handleSearchBttn}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>
                            <div className="mt-0 d-flex justify-content-center" style={{ gap: "0px 30px", overflow: "auto", scrollbarWidth: "none" }}>
                                <div>
                                    <button className='btn btn-outline-light' style={{ fontSize: "12px" }}>
                                        <span><i className="fa-solid fa-magnifying-glass"></i></span> Happy birthday
                                    </button>
                                </div>
                                <div>
                                    <button className='btn btn-outline-light' style={{ fontSize: "12px" }}>
                                        <span><i className="fa-solid fa-magnifying-glass"></i></span> thank you
                                    </button>
                                </div>
                                <div>
                                    <button className='btn btn-outline-light' style={{ fontSize: "12px" }}>
                                        <span><i className="fa-solid fa-magnifying-glass"></i></span> background
                                    </button>
                                </div>
                                <div>
                                    <button className='btn btn-outline-light' style={{ fontSize: "12px" }}>
                                        <span><i className="fa-solid fa-magnifying-glass"></i></span> Business
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomeBannerSearchbarFilterationCompo;
