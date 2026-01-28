import React from 'react';
import { useGlobalState } from '../../Context/Context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faXTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import bydefault from '../../assets/user.png';

function DashboardBanner1() {
    const { userData } = useGlobalState();

    if (!userData) {
        console.log("DATA NOT FOUND");
        return null;
    }

    return (
        <div className="container pt-5 pb-4 ">
            <p className='text-center fw-semibold'>Copyrighted content is not allowed to be uploaded on HDPiks. Your account may be suspended if you upload copyrighted material.</p>
            <div className="row d-flex justify-content-center">
                <div className="col-12">
                    <div className="text-center d-flex flex-column align-items-center">
                        <div
                            className="border rounded-circle overflow-hidden d-flex justify-content-center align-items-center"
                            style={{ width: '150px', height: '150px' }}
                        >
                            <img
                                src={userData.profileImage ? userData.profileImage : bydefault}
                                alt={`${userData.name || 'User'}'s Profile`}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                className="img-fluid"
                            />
                        </div>
                        <div className="mt-3 text-center">
                            <h1 className="fw-bold mb-1 text-capitalize display-6">{userData.name || 'Guest User'}</h1>
                            {userData.addbio && <p className="my-4 fs-5">{userData.addbio}</p>}
                            <div className="mt-2 d-flex justify-content-between">
                                <div>
                                    {userData.city && userData.country && (
                                        <p><i className="fa-solid fa-location-dot"></i> {userData.city}, {userData.country}</p>
                                    )}
                                </div>
                                <div className="d-flex" style={{ gap: "10px" }}>
                                    {userData.SocialMediaLinks?.map((item, index) => (
                                        <Link key={index} to={item.url} target="_blank" rel="noopener noreferrer">
                                            <FontAwesomeIcon
                                                style={{ fontSize: "22px" }}
                                                icon={
                                                    item.platform === 'LinkedIn' ? faLinkedin :
                                                    item.platform === 'Twitter' ? faXTwitter :
                                                    faInstagram
                                                }
                                            />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardBanner1;
