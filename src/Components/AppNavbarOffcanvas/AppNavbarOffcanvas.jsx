import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AppNavbarOffcanvasContentCompo from '../AppNavbarOffcanvasContentCompo/AppNavbarOffcanvasContentCompo';
import logo from '../../assets/logo1.webp'

function AppNavbarOffcanvas() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <div className="d-block d-lg-none">
                <Button onClick={handleShow} aria-label="Open navigation menu" title="Open navigation menu" style={{ zIndex: 1040, background: "transparent", border: "none", boxShadow: "none" }}>
                    <i className="fa-solid fa-bars-staggered fs-5 text-white"></i>
                </Button>
                <Offcanvas show={show} onHide={handleClose} style={{ zIndex: 1055 }}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>
                            <img src={logo} className='img-fluid' width={150} alt="" />
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <div className="">
                            <AppNavbarOffcanvasContentCompo handleClose={handleClose} />
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>
            </div>
        </>
    );
}

export default AppNavbarOffcanvas;
