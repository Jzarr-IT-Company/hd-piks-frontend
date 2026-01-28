import React from 'react'
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './DetailImages.css'
import modalimg from '../../assets/Nature&Outdoors.png'
function DetailImages({handleShow}) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            {/* <Button variant="primary" onClick={handleShow}>
                Launch static backdrop modal
            </Button> */}

            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <div style={{ display: 'flex' }}>
                        <img src="" alt="" />
                        <div style={{ marginLeft: "15px" }}>
                            <h6>Profile Name</h6>
                            <p>Follow . Donate</p>
                        </div>
                    </div>
                    <div>
                        <Button style={{ marginRight: "10px" }} className='button'><i class="fa-regular fa-heart" style={{ color: 'grey' }}></i> Like <span style={{ color: 'grey' }}>4</span></Button>
                        <Button className='button'><i class="fa-solid fa-download" style={{ color: 'grey' }}></i> Free Download </Button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className='imagesection'>
                        <img src={modalimg} alt="" />
                        <div className='infobtn'>
                            <Button style={{ marginRight: "10px" }} className='button'><i class="fa-solid fa-circle-info" style={{ color: 'grey' }}></i> More info</Button>
                            <Button className='button'><i class="fa-solid fa-share" style={{ color: 'grey' }}></i> Share </Button>
                        </div>
                    </div>
                    <div>
                        <h2>More Like This</h2>
                    </div>
                    <div className="row mt-4">
                        <div className="col-lg-6">
                            <div className="card over-css">
                                <img src={modalimg} alt="" />
                                <div className="card-img-overlay">
                                    <span className="name-text">kitchen Idea's</span>
                                    <div className="d-flex justify-content-end" style={{ marginTop: "100px", gap: "0px 3px" }} id="cust-css">
                                        <div className="dropdown">
                                            <button class="pre-btn-css" type="button" data-bs-toggle="modal" data-bs-target="#socialModal">
                                                <i class="fa fa-ellipsis-h" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <button className="down-pre-btn" type="button">
                                            <i className="fa fa-download" aria-hidden="true">
                                                <span style={{ fontSize: "small", fontWeight: "lighter", padding: "3px" }}>download</span>
                                            </i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default DetailImages