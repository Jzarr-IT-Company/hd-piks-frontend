import React, {lazy } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AppNavbarOffcanvas from '../AppNavbarOffcanvas/AppNavbarOffcanvas';

const HomeBannerSearchbarFilterationCompo = lazy(() => import('../HomeBannerSearchbarFilterationCompo/HomeBannerSearchbarFilterationCompo'));
const CreateImagesLikeCanva = lazy(() => import('../CreateImagesLikeCanva/CreateImagesLikeCanva'));
const NavbarProfileCompo = lazy(() => import('../NavbarProfileCompo/NavbarProfileCompo'));
const SidebarCompo = lazy(() => import('../SidebarCompo/SidebarCompo'));
const AppNavbarBanner1Compo = lazy(() => import('../AppNavbarBanner1Compo/AppNavbarBanner1Compo'));
const HomeBannerSearchFilterationCompo2 = lazy(() => import('../HomeBannerSearchFilterationCompo2/HomeBannerSearchFilterationCompo2'));

function AppNavbar() {
    return (
        <>
            <section className="py-0 my-0 main-div-custmoe-css">
                <Navbar expand="lg">
                    <Container fluid className='d-flex align-items-center'>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <AppNavbarOffcanvas />
                                <Link to="/">
                                    <span className='fs-3 text-white fw-bold'>HDpiks</span>
                                </Link>
                            </div>
                        </div>
                        <Navbar.Collapse id="navbarScroll">
                            <Nav
                                className="me-auto my-2 my-lg-0"
                                style={{ maxHeight: '100px' }}
                                navbarScroll
                            >
                                <SidebarCompo />
                            </Nav>
                            <div className="d-flex align-items-center" style={{ gap: "0px 20px" }}>
                                <CreateImagesLikeCanva />
                                <NavbarProfileCompo />
                            </div>
                        </Navbar.Collapse>
                        <div className="d-flex d-lg-none align-items-center" style={{ gap: "0px 20px" }}>
                            <CreateImagesLikeCanva />
                            <NavbarProfileCompo />
                        </div>
                    </Container>
                </Navbar>
                <div className="border my-0 custome-css">
                    <div className="card mb-0 custome-css-card" style={{ position: "relative", border: "none" }}>
                        <div className="card custme-css-background-card border">
                            <img rel="preload"
                                src={"https://res.cloudinary.com/dhssktx47/image/upload/v1732794661/1732794658871-877602389_ehaycm.webp"}
                                width={'100%'}
                                height={'100%'}
                                className='card-img w-100'
                                id='coustome-img-css' alt="banner-img" />
                            <div className="card-img-overlay card-img-overlay-css d-flex flex-column justify-content-center align-items-center">
                                <div className="mt-5 text-container">
                                    <h1 className="text-white text-center fw-bold">Free Stunning Stock Photos & Videos for Your Projects</h1>
                                    <p className="text-white text-center">
                                        Explore high-quality, royalty-free images and videos for all your creative needs.
                                    </p>
                                    <HomeBannerSearchbarFilterationCompo />
                                    <HomeBannerSearchFilterationCompo2 />
                                    <AppNavbarBanner1Compo />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default AppNavbar;
