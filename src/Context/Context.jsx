import React from 'react';
import { createContext, useContext, useState, useMemo } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useUI } from "./UIContext.jsx";
import { useUpload } from "./UploadContext.jsx";
import { useProfile } from "./ProfileContext.jsx";
const GlobalContext = createContext();
const useGlobalState = () => useContext(GlobalContext);
const GlobalStates = ({ children }) => {
    const [dataFromLS, setDataFromLS] = useState('');
    const {
        username, setUsername,
        semail, setsEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        userData, setUserData,
        creatorData, setCreatorData,
        authBootstrapLoading,
    } = useAuth();
    const {
        closeSidebar, setCloseSidebar,
        homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration,
    } = useUI();
    const {
        fullName, setFullName,
        email, setEmail,
        dob, setDob,
        gender, setGender,
        profession, setProfession,
        skills, setSkills,
        portfolioLink, setPortfolioLink,
        linkedIn, setLinkedIn,
        twitter, setTwitter,
        instagram, setInstagram,
        country, setCountry,
        state, setState,
        city, setCity,
        zipCode, setZipCode,
        bio, setBio,
        profileImage, setprofileImage,
        socialMediaLinks, setSocialMediaLinks,
        showContributorForm, setShowContributorForm,
    } = useProfile();
    const {
        imageSize, setImageSize,
        imageType, setImageType,
        imageUrl, setImageUrl,
        category, setCategory,
        subCategories, setSubCategories,
        selectedSubCategory, setSelectedSubCategory,
        subSubCategories, setSubSubCategories,
        selectedSubSubCategory, setSelectedSubSubCategory,
        selectPlan, setSelectPlan,
        title, setTitle,
        description, setDescription,
        expireDate, setExpireDate,
        zipFolder, setZipFolder,
        zipFolderUrl, setZipFolderUrl,
        termsChecked, setTermsChecked,
        contentChecked, setContentChecked,
        keywords, setKeywords,
        firseBaseFIlesStorage, setFIrebaseFilesdtorage,
        imageData, setImageData,
        s3Keys, setS3Keys,
        s3Urls, setS3Urls,
        fileMetadata, setFileMetadata,
        uploadProgress, setUploadProgress,
    } = useUpload();

    const contextValue = useMemo(() => ({
        closeSidebar, setCloseSidebar,
        fullName, setFullName,
        email, setEmail,
        dob, setDob,
        gender, setGender,
        profession, setProfession,
        skills, setSkills,
        portfolioLink, setPortfolioLink,
        linkedIn, setLinkedIn,
        twitter, setTwitter,
        instagram, setInstagram,
        country, setCountry,
        state, setState,
        city, setCity,
        zipCode, setZipCode,
        bio, setBio,
        socialMediaLinks, setSocialMediaLinks,
        profileImage, setprofileImage,
        username, setUsername,
        semail, setsEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        dataFromLS, setDataFromLS,
        homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration,
        userData, setUserData,
        creatorData, setCreatorData,
        showContributorForm, setShowContributorForm,
        imageSize, setImageSize,
        imageType, setImageType,
        imageUrl, setImageUrl,
        category, setCategory,
        subCategories, setSubCategories,
        selectedSubCategory, setSelectedSubCategory,
        subSubCategories, setSubSubCategories,
        selectedSubSubCategory, setSelectedSubSubCategory,
        selectPlan, setSelectPlan,
        title, setTitle,
        description, setDescription,
        expireDate, setExpireDate,
        zipFolder, setZipFolder,
        zipFolderUrl,setZipFolderUrl,
        keywords, setKeywords,
        termsChecked, setTermsChecked,
        contentChecked, setContentChecked,
        firseBaseFIlesStorage, setFIrebaseFilesdtorage,
        imageData, setImageData,
        // S3 fields
        s3Keys, setS3Keys,
        s3Urls, setS3Urls,
        fileMetadata, setFileMetadata,
        uploadProgress, setUploadProgress,
        authBootstrapLoading
    }), [closeSidebar, fullName, email, dob, gender, profession, skills, portfolioLink, linkedIn, twitter, instagram, country, state, city, zipCode, bio, profileImage, socialMediaLinks, username, semail, password, confirmPassword, dataFromLS, homeBannerSearchbarFilteration, userData, creatorData, imageSize, imageType, imageUrl, category, subCategories, selectedSubCategory, subSubCategories, selectedSubSubCategory, selectPlan, title, description, expireDate, zipFolder, zipFolderUrl, keywords, termsChecked, contentChecked, firseBaseFIlesStorage, imageData, s3Keys, s3Urls, fileMetadata, uploadProgress, setUserData, setCreatorData, showContributorForm, setShowContributorForm, authBootstrapLoading, setCloseSidebar, setHomeBannerSearchbarFilteration]);

    return <GlobalContext.Provider value={contextValue}>
        {children}
    </GlobalContext.Provider>;
}

export { GlobalStates, useGlobalState };
