import React, { useState, useEffect, useMemo } from 'react';
import './UploadBanner1.css';
import { fetchCategories } from '../../Services/category';
import { multipartUploadToS3 } from '../../Services/S3Service';
import UploadBanner1ImageCompo from '../UploadBanner1ImageCompo/UploadBanner1ImageCompo';
import { useGlobalState } from '../../Context/Context';
import UploadBtn from '../UploadBtn/UploadBtn';
import { message, Spin } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

function UploadBanner1() {
    const ZIP_REQUIRED_NAMES = ['mockups', 'vector', 'psd', 'templates', 'icons', 'nft'];
    const ZIP_OPTIONAL_NAMES = ['image'];

    const {
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
        creatorData,
        imageUrl,
        setImageUrl,
        imageType,
        setImageType,
        imageSize,
        setImageSize,
        s3Keys,
        setS3Keys,
        s3Urls,
        setS3Urls,
        fileMetadata,
        setFileMetadata,
        imageData,
        setImageData,
    } = useGlobalState();

    const [loading, setLoading] = useState(false);
    const [keywordInput, setKeywordInput] = useState('');
    const [categoryTree, setCategoryTree] = useState([]);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');

    const selectedCategoryNode = useMemo(
        () => categoryTree.find((c) => c._id === category),
        [categoryTree, category]
    );

    const selectedSubCategoryNode = useMemo(
        () => selectedCategoryNode?.children?.find((c) => c._id === selectedSubCategory),
        [selectedCategoryNode, selectedSubCategory]
    );

    const selectedSubSubCategoryNode = useMemo(
        () => selectedSubCategoryNode?.children?.find((c) => c._id === selectedSubSubCategory),
        [selectedSubCategoryNode, selectedSubSubCategory]
    );

    const selectedNames = useMemo(() => {
        return [
            selectedCategoryNode?.name,
            selectedSubCategoryNode?.name,
            selectedSubSubCategoryNode?.name,
        ]
            .filter(Boolean)
            .map((name) => name.trim().toLowerCase());
    }, [selectedCategoryNode, selectedSubCategoryNode, selectedSubSubCategoryNode]);

    const isZipRequired = useMemo(() => {
        return selectedNames.some((name) => ZIP_REQUIRED_NAMES.includes(name));
    }, [selectedNames]);

    const isZipVisible = useMemo(() => {
        return selectedNames.some((name) =>
            ZIP_REQUIRED_NAMES.includes(name) || ZIP_OPTIONAL_NAMES.includes(name)
        );
    }, [selectedNames]);

    const currentZipKey = useMemo(() => {
        if (Array.isArray(zipFolder)) {
            const first = zipFolder[0];
            if (typeof first === 'string') return first;
            return first?.s3Key || first?.key || '';
        }
        if (typeof zipFolder === 'string') return zipFolder;
        return zipFolder?.s3Key || zipFolder?.key || '';
    }, [zipFolder]);

    const currentZipUrl = useMemo(() => {
        if (typeof zipFolderUrl === 'string' && zipFolderUrl) return zipFolderUrl;
        if (Array.isArray(zipFolder)) {
            const first = zipFolder[0];
            if (typeof first === 'object' && first?.url) return first.url;
        } else if (zipFolder?.url) {
            return zipFolder.url;
        }
        return '';
    }, [zipFolder, zipFolderUrl]);

    const currentZipName = useMemo(() => {
        const source = currentZipKey || currentZipUrl;
        if (!source) return '';
        const withoutQuery = source.split('?')[0];
        return withoutQuery.split('/').pop() || source;
    }, [currentZipKey, currentZipUrl]);

    // Fetch categories from backend only if creatorData exists
    useEffect(() => {
        if (!creatorData) return;
        fetchCategories(true).then((cats) => {
            setCategoryTree(cats || []);
        });
    }, [creatorData]);

    useEffect(() => {
        if (!isZipVisible) {
            setZipFolder([]);
            setZipFolderUrl('');
        }
    }, [isZipVisible, setZipFolder, setZipFolderUrl]);

    // Prefill for edit mode using API (GET /images/:id)
    useEffect(() => {
        if (!editId) {
            // Not editing: ensure preview cleared if needed
            setImageUrl('');
            setImageType('');
            setImageSize('');
            return;
        }
        const fetchAsset = async () => {
            try {
                const res = await api.get(API_ENDPOINTS.GET_IMAGE_BY_ID(editId));
                const asset = res.data?.data;
                if (!asset) return;

                setCategory(asset.category || '');
                setSelectedSubCategory(asset.subcategory || '');
                setSelectedSubSubCategory(asset.subsubcategory || '');
                setSelectPlan(asset.freePremium || '');
                setTitle(asset.title || '');
                setDescription(asset.description || '');
                setZipFolder(asset.zipfolder || []);
                setZipFolderUrl(asset.zipfolderurl || '');
                setTermsChecked(!!asset.termsConditions);
                setContentChecked(!!asset.permissionLetter);
                setKeywords(asset.keywords || []);

                // Image + S3 data
                setImageUrl(asset.imageUrl || '');
                setImageType(asset.imagetype || asset.fileMetadata?.mimeType || '');
                setImageSize(asset.imagesize || asset.fileMetadata?.fileSizeFormatted || '');
                setS3Keys(asset.s3Key ? [asset.s3Key] : []);
                setS3Urls(asset.s3Url ? [asset.s3Url] : []);
                setFileMetadata(asset.fileMetadata ? [asset.fileMetadata] : []);
                setImageData(asset.imageData || []);
            } catch (err) {
                console.error('[UploadBanner1] Failed to load asset for edit', err);
            }
        };
        fetchAsset();
    }, [editId, setCategory, setSelectedSubCategory, setSelectedSubSubCategory, setSelectPlan, setTitle, setDescription, setZipFolder, setZipFolderUrl, setTermsChecked, setContentChecked, setKeywords, setImageUrl, setImageType, setImageSize, setS3Keys, setS3Urls, setFileMetadata, setImageData]);

    // Dynamic category selection handlers
    const handleCategoryChange = (event) => {
        const selectedId = event.target.value;
        setCategory(selectedId);
        const selectedCat = categoryTree.find(c => c._id === selectedId);
        const subCats = selectedCat?.children || [];
        setSubCategories(subCats);
        setSelectedSubCategory('');
        setSubSubCategories([]);
        setSelectedSubSubCategory('');
    };
    const handleSubCategoryChange = (event) => {
        const selectedId = event.target.value;
        setSelectedSubCategory(selectedId);
        const parentCat = categoryTree.find(c => c._id === category);
        const selectedSubCat = parentCat?.children?.find(c => c._id === selectedId);
        const subSubCats = selectedSubCat?.children || [];
        setSubSubCategories(subSubCats);
        setSelectedSubSubCategory('');
    };
    const handleSubSubCategoryChange = (event) => {
        setSelectedSubSubCategory(event.target.value);
    };

    const handleTermsChange = () => {
        setTermsChecked(!termsChecked);
    };

    const handleContentChange = () => {
        setContentChecked(!contentChecked);
    };

    const handleZipFolders = async (file) => {
        if (!file) return;
        setLoading(true);
        try {
            const result = await multipartUploadToS3(file, category, () => {});
            setZipFolderUrl(result.s3Url);
            setZipFolder(result.s3Key);
            message.success('ZIP uploaded successfully!');
        } catch (error) {
            setZipFolder([]);
            message.error('Error uploading ZIP: ' + (error.message || 'Upload failed'));
        } finally {
            setLoading(false);
        }
    };

    const addKeyword = () => {
        const cleaned = keywordInput.trim();
        if (cleaned && !keywords.includes(cleaned)) {
            setKeywords([...keywords, cleaned]);
            setKeywordInput('');
        }
    };

    const deleteKeyword = (index) => {
        setKeywords(keywords.filter((_, i) => i !== index));
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addKeyword();
        }
    };

    return (
        <div className="upload-grid">
            <div className="upload-card upload-card--drop">
                <h4 className="upload-heading">Upload files</h4>
                <p className="upload-sub">Drag & drop or click to choose files from your device.</p>
                {/* Show preview from global imageUrl/imageType (edit or new upload) */}
                {imageUrl && imageType ? (
                    imageType.startsWith('video/') ? (
                        <video src={imageUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
                    ) : (
                        <img src={imageUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
                    )
                ) : null}
                <UploadBanner1ImageCompo />
            </div>

            <div className="upload-card upload-card--form">
                <div className="upload-form">
                    <div className="upload-field">
                        <label className="upload-label">Select Category</label>
                        <select
                            className="form-select upload-control"
                            id="categorySelect"
                            onChange={handleCategoryChange}
                            value={category}
                        >
                            <option value="" disabled>Select Category</option>
                            {categoryTree.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {subCategories.length > 0 && (
                        <div className="upload-field">
                            <label className="upload-label">Select Sub-Category</label>
                            <select
                                className="form-select upload-control"
                                id="subCategorySelect"
                                onChange={handleSubCategoryChange}
                                value={selectedSubCategory}
                            >
                                <option value="" disabled>Select Sub-Category</option>
                                {subCategories.map((subCat) => (
                                    <option key={subCat._id} value={subCat._id}>{subCat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {subSubCategories.length > 0 && (
                        <div className="upload-field">
                            <label className="upload-label">Select Sub-Sub-Category</label>
                            <select
                                className="form-select upload-control"
                                id="subSubCategorySelect"
                                onChange={handleSubSubCategoryChange}
                                value={selectedSubSubCategory}
                            >
                                <option value="" disabled>Select Sub-Sub-Category</option>
                                {subSubCategories.map((subSubCat) => (
                                    <option key={subSubCat._id} value={subSubCat._id}>{subSubCat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="upload-field">
                        <label className="upload-label">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="form-control upload-control"
                            id="titleInput"
                            placeholder="Enter title"
                        />
                    </div>

                    <div className="upload-field">
                        <label className="upload-label">Description</label>
                        <textarea
                            onChange={(event) => setDescription(event.target.value)}
                            value={description}
                            className="form-control upload-control"
                            id="descriptionInput"
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="upload-field">
                        <label className="upload-label">Add Keywords (at least 5 keywords)</label>
                        <div className="upload-keyword-row">
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(event) => setKeywordInput(event.target.value)}
                                onKeyPress={handleKeyPress}
                                className="form-control upload-control"
                                id="keywordInput"
                                placeholder="Keywords"
                            />
                            <button onClick={addKeyword} className="btn btn-primary upload-btn-minimal">
                                Add
                            </button>
                        </div>
                        <div className="upload-chips">
                            {keywords?.map((keyword, index) => (
                                <span className="upload-chip" key={keyword}>
                                    {keyword}
                                    <button
                                        type="button"
                                        className="upload-chip__close"
                                        onClick={() => deleteKeyword(index)}
                                        aria-label="Remove keyword"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="upload-field">
                        <label className="upload-label">Select Plan</label>
                        <select
                            className="form-select upload-control"
                            id="planSelect"
                            value={selectPlan}
                            onChange={(event) => setSelectPlan(event.target.value)}
                        >
                            <option value="" disabled>
                                Select Plan
                            </option>
                            <option value="Free">Free</option>
                            <option value="Premium">Premium</option>
                        </select>
                    </div>

                    {isZipVisible && (
                        <div className="upload-field">
                            <label className="upload-label">
                                Upload Zip File
                                <span className="ms-2 text-muted small">
                                    ({isZipRequired ? 'Required' : 'Optional'})
                                </span>
                            </label>
                            <input
                                type="file"
                                id="zipFileInput"
                                className="form-control upload-control"
                                accept=".zip"
                                onChange={(event) => handleZipFolders(event.target.files[0])}
                            />
                            {loading ? (
                                <div className="mt-2">
                                    <Spin />
                                </div>
                            ) : null}
                            {!loading && currentZipName ? (
                                <div className="mt-2 small text-muted">
                                    Current ZIP: <strong>{currentZipName}</strong>
                                    {currentZipUrl ? (
                                        <>
                                            {' '}
                                            <a
                                                href={currentZipUrl}
                                                download={currentZipName || true}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Download
                                            </a>
                                        </>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="upload-terms">
                        <label className="upload-terms__item">
                            <input type="checkbox" checked={termsChecked} onChange={handleTermsChange} />
                            <span>
                                <Link className="text-primary text-decoration-underline" to={'/termsandcondition'}>
                                    Terms and Conditions
                                </Link>
                                , No copyrighted content allowed
                            </span>
                        </label>
                        <label className="upload-terms__item">
                            <input type="checkbox" checked={contentChecked} onChange={handleContentChange} />
                            <span>If you wish to upload content related to a restricted area or person, please provide a permission letter.</span>
                        </label>
                    </div>

                    <UploadBtn isZipRequired={isZipRequired} />
                </div>
            </div>
        </div>
    );
}

export default UploadBanner1;

