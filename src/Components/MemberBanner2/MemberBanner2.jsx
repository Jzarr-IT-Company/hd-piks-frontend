import React, { useCallback } from 'react';
import img from '../../assets/user2.png';
import './MemberBanner2.css';  
import { useNavigate } from 'react-router-dom';

const MemberBanner2 = React.memo(({ userData }) => {
    const navigate = useNavigate();

    const handleNavigation = useCallback((id) => {
        navigate(`/memberdetail/${id}`);
    }, [navigate]);

    return (
        <div className="container-fluid mt-3">
            <div className="row" style={{ gap: "20px 0px" }}>
                {
                    userData.map((data) => {
                        const name = data.name.slice(0, 20);
                        return (
                            <div key={data._id} className="col-md-6 col-sm-6" onClick={() => handleNavigation(data._id)}>
                                <div className="card rounded-4 position-relative card-hover">
                                    <img loading="lazy" className="rounded-top-4" height={160} style={{ objectFit: "cover" }} alt="..." />
                                    <div className="card-body rounded-bottom-4" style={{ backgroundColor: "#80019d" }}>
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <img 
                                                src={data.profileImage || img} 
                                                loading="lazy" 
                                                style={{ borderRadius: "50%", width: "80px", height: "80px", objectFit: "cover", position: "relative", bottom: "40px" }} 
                                                alt="" 
                                            />
                                            <p className='mb-3 fs-4 fw-semibold text-white text-capitalize' style={{ position: "relative", bottom: "23px" }}>{name}</p>
                                            <button className='btn btn-light' style={{ position: 'relative', bottom: "20px" }}>Follow</button>
                                        </div>
                                    </div>
                                    <div className="overlay"></div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
});

export default MemberBanner2;
