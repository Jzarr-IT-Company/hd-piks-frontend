import React from 'react';
import api from '../Services/api.js';
import { getUserById } from '../Services/user.js';
import { API_ENDPOINTS } from '../config/api.config.js';
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
const GlobalContext = createContext();
const useGlobalState = () => useContext(GlobalContext);
const GlobalStates = ({ children }) => {
    const [closeSidebar, setCloseSidebar] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [profession, setProfession] = useState('');
    const [skills, setSkills] = useState('');
    const [portfolioLink, setPortfolioLink] = useState('');
    const [linkedIn, setLinkedIn] = useState('');
    const [twitter, setTwitter] = useState('');
    const [instagram, setInstagram] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setprofileImage] = useState('');
    const [socialMediaLinks, setSocialMediaLinks] = useState([
        { platform: "LinkedIn", url: "" },
        { platform: "Twitter", url: "" },
        { platform: "Instagram", url: "" },
    ]);
    const [username, setUsername] = useState('');
    const [semail, setsEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dataFromLS, setDataFromLS] = useState('');
    const [homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration] = useState("Photos");
    const [userData, setUserData] = useState({});
    const [creatorData, setCreatorData] = useState(undefined);
    const [imageSize, setImageSize] = useState('');
    const [imageType, setImageType] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [subSubCategories, setSubSubCategories] = useState([]);
    const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');
    const [selectPlan, setSelectPlan] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expireDate, setExpireDate] = useState('');
    const [zipFolder, setZipFolder] = useState([]);
    const [zipFolderUrl,setZipFolderUrl]=useState('');
    const [termsChecked, setTermsChecked] = useState(false);
    const [contentChecked, setContentChecked] = useState(false);
    const [keywords, setKeywords] = useState([]);
    const [firseBaseFIlesStorage, setFIrebaseFilesdtorage] = useState([]);
    const [imageData, setImageData] = useState([]);
    const [showContributorForm, setShowContributorForm] = useState(false);
    
    // AWS S3 Metadata Fields
    const [s3Keys, setS3Keys] = useState([]);              // Array of S3 keys
    const [s3Urls, setS3Urls] = useState([]);              // Array of S3 URLs
    const [fileMetadata, setFileMetadata] = useState([]);  // Array of file metadata
    const [uploadProgress, setUploadProgress] = useState(0); // Upload progress percentage
    
    const id = Cookies.get("id");

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const user = await getUserById(id);
                setUserData(user);
                const creatorRes = await api.get(API_ENDPOINTS.CREATOR_ME);
                setCreatorData(creatorRes.data?.data || null);
            } catch (error) {
                console.error("Error fetching user data", error);
            }
        };

        fetchData();
    }, [id]);  
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
        uploadProgress, setUploadProgress
    }), [closeSidebar, fullName, email, dob, gender, profession, skills, portfolioLink, linkedIn, twitter, instagram, country, state, city, zipCode, bio, profileImage, socialMediaLinks, username, semail, password, confirmPassword, dataFromLS, homeBannerSearchbarFilteration, userData, creatorData, imageSize, imageType, imageUrl, category, subCategories, selectedSubCategory, subSubCategories, selectedSubSubCategory, selectPlan, title, description, expireDate, zipFolder, keywords, termsChecked, contentChecked, firseBaseFIlesStorage, imageData, s3Keys, s3Urls, fileMetadata, uploadProgress, setUserData, setCreatorData, showContributorForm, setShowContributorForm]);

    return <GlobalContext.Provider value={contextValue}>
        {children}
    </GlobalContext.Provider>;
}

export { GlobalStates, useGlobalState };
