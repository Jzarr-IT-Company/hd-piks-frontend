import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import AppNavbarOffcanvas from '../AppNavbarOffcanvas/AppNavbarOffcanvas';
const CreateImagesLikeCanva = React.lazy(() => import('../CreateImagesLikeCanva/CreateImagesLikeCanva'));
const NavbarProfileCompo = React.lazy(() => import('../NavbarProfileCompo/NavbarProfileCompo'));
const SidebarCompo = React.lazy(() => import('../SidebarCompo/SidebarCompo'));

function TopNavOnly() {
    return (
        <section className="main-div-custmoe-css" style={{margin:0, padding:0, minHeight:'unset', height:'unset'}}>
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
        </section>
    );
}

export default TopNavOnly;
