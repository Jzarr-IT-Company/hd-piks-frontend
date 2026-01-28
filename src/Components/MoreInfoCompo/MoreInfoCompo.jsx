import React, { useEffect } from 'react';
import { Modal } from 'antd';

function MoreInfoCompo({ imagesData, userData }) {
    const [open, setOpen] = React.useState(false);

    useEffect(() => {}, [imagesData, userData]);

    const handleOpenModal = async () => {
        setOpen(true);
        console.log(imagesData, userData);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <>
            <button className='d-none d-md-block py-3 px-3 btn border-secondary' style={{fontSize:"17px"}} onClick={handleOpenModal}>
                <i className="fa-solid fa-circle-info"></i> More info
            </button>
            <button  className='d-block d-md-none py-2 btn btn-primary' style={{fontSize:"17px"}} onClick={handleOpenModal}>
                <i className="fa-solid fa-circle-info"></i>
            </button>
            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                centered
                footer={null}  
            >
                <div className="p-3">
                    <div
                        className="d-flex justify-content-center align-items-center mb-4"
                        style={{ gap: '20px' }}
                    >
                        <div>
                            {imagesData.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.imageUrl}
                                    className="img-fluid rounded-3"
                                    style={{ width: '200px', height: '140px', objectFit: 'contain' }}
                                    alt="Image Preview"
                                />
                            ))}
                        </div>
                        <div>
                            <h5 className="mb-3">Picture Details</h5>
                            {imagesData.map((img, index) => (
                                <p key={index}>
                                    Uploaded on <strong>{formatDate(img.updatedAt)}</strong>
                                </p>
                            ))}
                        </div>
                    </div>
                    <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ gap: '40px' }}
                    >
                        <div className="text-center">
                            <p className="mb-0"><strong>Views</strong></p>
                            <p className="mt-0 text-primary">0</p>
                        </div>
                        <div className="text-center">
                            <p className="mb-0"><strong>Likes</strong></p>
                            <p className="mt-0 text-success">0</p>
                        </div>
                        <div className="text-center">
                            <p className="mb-0"><strong>Downloads</strong></p>
                            <p className="mt-0 text-danger">0</p>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default MoreInfoCompo;
