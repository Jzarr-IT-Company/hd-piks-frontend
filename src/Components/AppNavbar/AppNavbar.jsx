import React, {lazy } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AppNavbarOffcanvas from '../AppNavbarOffcanvas/AppNavbarOffcanvas';
import HomeBannerSearchbarFilterationCompo from '../HomeBannerSearchbarFilterationCompo/HomeBannerSearchbarFilterationCompo';
import HomeBannerSearchFilterationCompo2 from '../HomeBannerSearchFilterationCompo2/HomeBannerSearchFilterationCompo2';
import AppNavbarBanner1Compo from '../AppNavbarBanner1Compo/AppNavbarBanner1Compo';
import AiToolsCards from '../AiToolsCards/AiToolsCards';
import heroSectionImg from '../../assets/Hero-Section.jpg';

const CreateImagesLikeCanva = lazy(() => import('../CreateImagesLikeCanva/CreateImagesLikeCanva'));
const NavbarProfileCompo = lazy(() => import('../NavbarProfileCompo/NavbarProfileCompo'));
const SidebarCompo = lazy(() => import('../SidebarCompo/SidebarCompo'));

function AppNavbar() {
    const handleLogoClick = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    return (
        <>
            <section className="py-0 my-0 main-div-custmoe-css">
                <Navbar expand="lg">
                    <Container fluid className='d-flex align-items-center'>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <AppNavbarOffcanvas />
                                <Link to="/" onClick={handleLogoClick}>
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
                            <img
                                src={heroSectionImg}
                                width={'100%'}
                                height={'100%'}
                                className='card-img w-100'
                                id='coustome-img-css'
                                alt="banner-img"
                                fetchPriority="high"
                                decoding="async"
                            />
                            <div className="card-img-overlay card-img-overlay-css d-flex flex-column justify-content-center align-items-center">
                                <div className="text-container hero-content-stack">
                                    <h1 className="text-white text-center fw-bold">
                                        Free Stunning high-quality photos, videos & AI{" "}
                                        <br className="hero-heading-break" />
                                        for all your creative projects.
                                    </h1>
                                    <p className="text-white text-center">
                                        Explore high-quality, royalty-free images and videos for all your creative needs.
                                    </p>
                                    <HomeBannerSearchbarFilterationCompo />
                                    <div className="mb-2 mb-md-3 px-1 px-md-0 w-100" >
                                        <AiToolsCards
                                        />
                                    </div>
                                    {/* <HomeBannerSearchFilterationCompo2 />   yaghan glti thi */}
                                    {/* <AppNavbarBanner1Compo /> */}
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
