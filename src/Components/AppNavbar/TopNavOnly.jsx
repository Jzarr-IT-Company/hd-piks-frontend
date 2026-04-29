import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AppNavbarOffcanvas from '../AppNavbarOffcanvas/AppNavbarOffcanvas';
import logo from '../../assets/logo.png';
const CreateImagesLikeCanva = React.lazy(() => import('../CreateImagesLikeCanva/CreateImagesLikeCanva'));
const NavbarProfileCompo = React.lazy(() => import('../NavbarProfileCompo/NavbarProfileCompo'));
const SidebarCompo = React.lazy(() => import('../SidebarCompo/SidebarCompo'));

function TopNavOnly() {
    const handleLogoClick = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    return (
        <section className="main-div-custmoe-css top-nav-only">
            <Navbar expand="lg">
                <Container fluid className='d-flex align-items-center'>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <AppNavbarOffcanvas />
                            <Link to="/" onClick={handleLogoClick} style={{ display: 'inline-flex', alignItems: 'center', marginRight: 18 }}>
                                <img src={logo} alt="HDpiks" style={{ height: 40, width: 150, objectFit: 'cover', objectPosition: 'left center', display: 'block' }} />
                            </Link>
                        </div>
                    </div>
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                        >
                            <SidebarCompo />
                        </Nav>
                        <div className="d-flex align-items-center hdp-navbar-actions">
                            <CreateImagesLikeCanva />
                            <NavbarProfileCompo />
                        </div>
                    </Navbar.Collapse>
                    <div className="d-flex d-lg-none align-items-center hdp-navbar-actions">
                        <CreateImagesLikeCanva />
                        <NavbarProfileCompo />
                    </div>
                </Container>
            </Navbar>
        </section>
    );
}

export default TopNavOnly;






