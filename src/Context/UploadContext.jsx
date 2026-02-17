import React, { createContext, useContext, useMemo, useState } from "react";

const UploadContext = createContext(null);

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error("useUpload must be used within UploadProvider");
    }
    return context;
};

export const UploadProvider = ({ children }) => {
    const [imageSize, setImageSize] = useState("");
    const [imageType, setImageType] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [category, setCategory] = useState("");
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [subSubCategories, setSubSubCategories] = useState([]);
    const [selectedSubSubCategory, setSelectedSubSubCategory] = useState("");
    const [selectPlan, setSelectPlan] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [expireDate, setExpireDate] = useState("");
    const [zipFolder, setZipFolder] = useState([]);
    const [zipFolderUrl, setZipFolderUrl] = useState("");
    const [termsChecked, setTermsChecked] = useState(false);
    const [contentChecked, setContentChecked] = useState(false);
    const [keywords, setKeywords] = useState([]);
    const [firseBaseFIlesStorage, setFIrebaseFilesdtorage] = useState([]);
    const [imageData, setImageData] = useState([]);
    const [s3Keys, setS3Keys] = useState([]);
    const [s3Urls, setS3Urls] = useState([]);
    const [fileMetadata, setFileMetadata] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const value = useMemo(
        () => ({
            imageSize,
            setImageSize,
            imageType,
            setImageType,
            imageUrl,
            setImageUrl,
            category,
            setCategory,
            subCategories,
            setSubCategories,
            selectedSubCategory,
            setSelectedSubCategory,
            subSubCategories,
            setSubSubCategories,
            selectedSubSubCategory,
            setSelectedSubSubCategory,
            selectPlan,
            setSelectPlan,
            title,
            setTitle,
            description,
            setDescription,
            expireDate,
            setExpireDate,
            zipFolder,
            setZipFolder,
            zipFolderUrl,
            setZipFolderUrl,
            termsChecked,
            setTermsChecked,
            contentChecked,
            setContentChecked,
            keywords,
            setKeywords,
            firseBaseFIlesStorage,
            setFIrebaseFilesdtorage,
            imageData,
            setImageData,
            s3Keys,
            setS3Keys,
            s3Urls,
            setS3Urls,
            fileMetadata,
            setFileMetadata,
            uploadProgress,
            setUploadProgress,
        }),
        [
            imageSize,
            imageType,
            imageUrl,
            category,
            subCategories,
            selectedSubCategory,
            subSubCategories,
            selectedSubSubCategory,
            selectPlan,
            title,
            description,
            expireDate,
            zipFolder,
            zipFolderUrl,
            termsChecked,
            contentChecked,
            keywords,
            firseBaseFIlesStorage,
            imageData,
            s3Keys,
            s3Urls,
            fileMetadata,
            uploadProgress,
        ]
    );

    return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
};

