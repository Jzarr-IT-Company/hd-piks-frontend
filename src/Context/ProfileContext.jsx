import React, { createContext, useContext, useMemo, useState } from "react";

const ProfileContext = createContext(null);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within ProfileProvider");
    }
    return context;
};

export const ProfileProvider = ({ children }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [profession, setProfession] = useState("");
    const [skills, setSkills] = useState("");
    const [portfolioLink, setPortfolioLink] = useState("");
    const [linkedIn, setLinkedIn] = useState("");
    const [twitter, setTwitter] = useState("");
    const [instagram, setInstagram] = useState("");
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setprofileImage] = useState("");
    const [socialMediaLinks, setSocialMediaLinks] = useState([
        { platform: "LinkedIn", url: "" },
        { platform: "Twitter", url: "" },
        { platform: "Instagram", url: "" },
    ]);
    const [showContributorForm, setShowContributorForm] = useState(false);

    const value = useMemo(
        () => ({
            fullName,
            setFullName,
            email,
            setEmail,
            dob,
            setDob,
            gender,
            setGender,
            profession,
            setProfession,
            skills,
            setSkills,
            portfolioLink,
            setPortfolioLink,
            linkedIn,
            setLinkedIn,
            twitter,
            setTwitter,
            instagram,
            setInstagram,
            country,
            setCountry,
            state,
            setState,
            city,
            setCity,
            zipCode,
            setZipCode,
            bio,
            setBio,
            profileImage,
            setprofileImage,
            socialMediaLinks,
            setSocialMediaLinks,
            showContributorForm,
            setShowContributorForm,
        }),
        [
            fullName,
            email,
            dob,
            gender,
            profession,
            skills,
            portfolioLink,
            linkedIn,
            twitter,
            instagram,
            country,
            state,
            city,
            zipCode,
            bio,
            profileImage,
            socialMediaLinks,
            showContributorForm,
        ]
    );

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

