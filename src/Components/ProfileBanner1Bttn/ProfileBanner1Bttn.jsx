import React, { useState } from 'react'
import { useGlobalState } from '../../Context/Context';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

function ProfileBanner1Bttn() {
    const { fullName,email, dob,gender,profession,skills,portfolioLink,country,state,city, zipCode,socialMediaLinks,profileImage,bio, setCreatorData, showContributorForm, userData } = useGlobalState();
    const [loading,setLoading]=useState(false)
    const location = useLocation();
    
    const id = Cookies.get('id')
   const navigate = useNavigate();
    const isContributorFlow = showContributorForm || location.pathname === '/profile/contributor';
    const handleBtn = async () => {
        setLoading(true)
        try {
            const linkUrls = (socialMediaLinks || [])
                .map((item) => (typeof item === 'string' ? item : item?.url))
                .filter((u) => u);
            if (portfolioLink) {
                linkUrls.unshift(portfolioLink);
            }

            const skillsArray = Array.isArray(skills)
                ? skills.filter(Boolean)
                : (skills ? [skills] : []);

            const creatorPayload = {
                displayName: fullName || userData?.name,
                bio,
                country,
                city,
                state,
                zipCode,
                gender,
                dob,
                profession,
                skills: skillsArray,
                website: portfolioLink,
                portfolioLinks: linkUrls,
                socialLinks: linkUrls,
            };

            if (isContributorFlow) {
                const applyRes = await api.post(API_ENDPOINTS.CREATOR_APPLY, {
                    contributorProfile: creatorPayload
                });
                setCreatorData(applyRes.data?.data || null);
                navigate('/dashboard');
            } else {
                const response = await api.post(API_ENDPOINTS.UPDATE_USER, {
                    id, name: fullName, city, gender, DOB: dob, country, profileImage: profileImage, addbio: bio, Profession: profession, Skills: skills, PortfolioLink: portfolioLink, SocialMediaLinks: socialMediaLinks,isActive:true
                })
                if(response.data.status===200){
                    navigate('/dashboard')
                }
            }

        } catch (error) {
            message.error('Could not submit creator application');
            console.log("ERROR", error.message)
        }finally{
        setLoading(false)
        }
    }
    return (
        <>
            <div className="">
                <button className='btn btn-dark w-100 py-3' onClick={handleBtn}>
                    {loading ? <Spin /> : isContributorFlow ? 'Submit' : 'Update'}
                </button>
            </div>
        </>
    )
}

export default ProfileBanner1Bttn