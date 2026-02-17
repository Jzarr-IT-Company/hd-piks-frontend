import React, { useState } from 'react'
import { useProfile } from '../../Context/ProfileContext';
import { useAuth } from '../../Context/AuthContext';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { getContributorState } from '../../utils/contributorStatus';

function ProfileBanner1Bttn({ creatorProfileImage = '' }) {
    const { fullName,email, dob,gender,profession,skills,portfolioLink,country,state,city, zipCode,socialMediaLinks,profileImage,bio } = useProfile();
    const { setCreatorData, creatorData, userData } = useAuth();
    const [loading,setLoading]=useState(false)
    const location = useLocation();
    
    const id = Cookies.get('id')
    const navigate = useNavigate();
    const isContributorRoute = location.pathname === '/profile/contributor';
    const contributor = getContributorState(userData, creatorData);
    const isContributorPending = contributor.isPending;
    const isContributorApproved = contributor.isApproved;

    const isValidUrl = (url) => {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return /^https?:$/i.test(parsed.protocol);
        } catch {
            return false;
        }
    };

    const contributorErrors = (() => {
        if (!isContributorRoute) return [];
        const errors = [];
        const name = (fullName || '').trim();
        const bioText = (bio || '').trim();
        const countryText = (country || '').trim();
        const professionText = (profession || '').trim();
        const skillsText = Array.isArray(skills) ? skills.join(', ') : (skills || '');
        const parsedSkills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
        const links = (socialMediaLinks || [])
            .map((item) => (typeof item === 'string' ? item : item?.url))
            .filter(Boolean);

        if (name.length < 3) errors.push('Display name must be at least 3 characters.');
        if (bioText.length < 20) errors.push('Bio must be at least 20 characters.');
        if (!countryText) errors.push('Country is required.');
        if (!professionText) errors.push('Profession is required.');
        if (!dob) errors.push('Date of birth is required.');
        if (parsedSkills.length === 0) errors.push('Add at least one skill.');
        if (portfolioLink && !isValidUrl(portfolioLink)) errors.push('Website/portfolio link must be a valid URL.');
        if (links.some((link) => !isValidUrl(link))) errors.push('All social links must be valid URLs.');
        return errors;
    })();

    const canSubmit = !loading && (!isContributorRoute || (!isContributorPending && contributorErrors.length === 0));

    const handleBtn = async () => {
        if (isContributorRoute && isContributorPending) {
            message.info('Your contributor application is under review.');
            return;
        }

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
                profileImage: creatorProfileImage ? { url: creatorProfileImage } : undefined,
            };

            if (isContributorRoute) {
                if (isContributorApproved) {
                    const updateRes = await api.patch(API_ENDPOINTS.CREATOR_ME, creatorPayload);
                    setCreatorData(updateRes.data?.data || creatorData || null);
                    message.success('Creator profile updated successfully');
                    navigate('/profile/contributor');
                } else {
                const applyRes = await api.post(API_ENDPOINTS.CREATOR_APPLY, {
                        contributorProfile: creatorPayload
                    });
                    setCreatorData(applyRes.data?.data || null);
                    message.success('Contributor application submitted');
                    navigate('/dashboard');
                }
            } else {
                const response = await api.post(API_ENDPOINTS.UPDATE_USER, {
                    id, name: fullName, city, gender, DOB: dob, country, profileImage: profileImage, addbio: bio, Profession: profession, Skills: skills, PortfolioLink: portfolioLink, SocialMediaLinks: socialMediaLinks,isActive:true
                })
                if(response.data.status===200){
                    message.success('Profile updated successfully');
                    navigate('/dashboard')
                }
            }

        } catch (error) {
            const apiMessage = error?.response?.data?.message;
            message.error(apiMessage || 'Could not submit request');
            console.log("ERROR", error.message)
        }finally{
        setLoading(false)
        }
    }
    return (
        <>
            <div className="">
                {isContributorRoute && contributorErrors.length > 0 && !isContributorPending && (
                    <div className="small text-danger mb-2">
                        {contributorErrors[0]}
                    </div>
                )}
                <button className='btn btn-dark w-100 py-3' onClick={handleBtn} disabled={!canSubmit}>
                    {loading ? <Spin /> : isContributorRoute ? (isContributorApproved ? 'Update creator profile' : isContributorPending ? 'Application pending' : 'Submit application') : 'Update profile'}
                </button>
            </div>
        </>
    )
}

export default ProfileBanner1Bttn
