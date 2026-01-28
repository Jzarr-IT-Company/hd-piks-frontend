import React, { useState, useEffect } from 'react';
import './UploadBanner1.css';
import axios from 'axios';
import { fetchCategories, buildCategoryTree } from '../../Services/category';
import { multipartUploadToS3 } from '../../Services/S3Service';
import UploadBanner1ImageCompo from '../UploadBanner1ImageCompo/UploadBanner1ImageCompo';
import { useGlobalState } from '../../Context/Context';
import UploadBtn from '../UploadBtn/UploadBtn';
import { message, Spin } from 'antd';
import { Link } from 'react-router-dom';

function UploadBanner1() {
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
        setZipFolder,
        setZipFolderUrl,
        termsChecked,
        setTermsChecked,
        contentChecked,
        setContentChecked,
        keywords,
        setKeywords,
        creatorData,
        ...rest
    } = useGlobalState();
    // ...existing code...
    const [loading, setLoading] = useState(false);
    const [keywordInput, setKeywordInput] = useState('');
    // Add state for image preview and meta
    const [imageUrl, setImageUrl] = useState('');
    const [imagetype, setImageType] = useState('');
    const [imagesize, setImageSize] = useState('');
    // Dynamic categories
    const [allCategories, setAllCategories] = useState([]); // flat list
    const [categoryTree, setCategoryTree] = useState([]); // tree

    // Fetch categories from backend only if creatorData exists
    useEffect(() => {
        if (!creatorData) return;
        fetchCategories(true).then((cats) => {
            setAllCategories(cats);
            setCategoryTree(buildCategoryTree(cats));
        });
    }, [creatorData]);

    // Prefill for edit (if needed, can be extended to use ObjectIds)
    useEffect(() => {
        const editAsset = sessionStorage.getItem('editAsset');
        if (editAsset) {
            try {
                const asset = JSON.parse(editAsset);
                setCategory(asset.category || '');
                setSelectedSubCategory(asset.subcategory || '');
                setSelectedSubSubCategory(asset.subsubcategory || '');
                setSelectPlan(asset.freePremium || '');
                setTitle(asset.title || '');
                setDescription(asset.description || '');
                setZipFolder(asset.zipfolder || '');
                setZipFolderUrl(asset.zipfolderurl || '');
                setTermsChecked(asset.termsConditions || false);
                setContentChecked(asset.permissionLetter || false);
                setKeywords(asset.keywords || []);
                setImageUrl(asset.imageUrl || '');
                setImageType(asset.imagetype || '');
                setImageSize(asset.imagesize || '');
            } catch {}
        } else {
            setImageUrl('');
            setImageType('');
            setImageSize('');
        }
    }, []);

    // Dynamic category selection handlers
    // Top-level category
    const handleCategoryChange = (event) => {
        const selectedId = event.target.value;
        setCategory(selectedId);
        // Find children for subcategories
        const subCats = allCategories.filter(c => c.parent === selectedId);
        setSubCategories(subCats);
        setSelectedSubCategory('');
        setSubSubCategories([]);
        setSelectedSubSubCategory('');
    };
    // Subcategory
    const handleSubCategoryChange = (event) => {
        const selectedId = event.target.value;
        setSelectedSubCategory(selectedId);
        const subSubCats = allCategories.filter(c => c.parent === selectedId);
        setSubSubCategories(subSubCats);
        setSelectedSubSubCategory('');
    };
    // Subsubcategory
    const handleSubSubCategoryChange = (event) => {
        setSelectedSubSubCategory(event.target.value);
    };

    const handleTermsChange = () => {
        setTermsChecked(!termsChecked);
    };

    const handleContentChange = () => {
        setContentChecked(!contentChecked);
    };

    // S3 Multipart ZIP upload
    const handleZipFolders = async (file) => {
        if (!file) return;
        setLoading(true);
        try {
            const result = await multipartUploadToS3(file, category, (progress) => {
                // Optionally show progress
                // setProgress(progress);
            });
            setZipFolderUrl(result.s3Url);
            setZipFolder(result.s3Key);
            message.success('ZIP uploaded successfully!');
        } catch (error) {
            setZipFolder('');
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

    // Track if a new file has been selected in UploadBanner1ImageCompo
    // If imageUrl is set (from edit) but UploadBanner1ImageCompo sets a new image, only show the new image
    // We'll use imageUrl as the single source of truth for preview
    return (
        <div className="upload-grid">
            <div className="upload-card upload-card--drop">
                <h4 className="upload-heading">Upload files</h4>
                <p className="upload-sub">Drag & drop or click to choose files from your device.</p>
                {/* Show preview only if imageUrl is set (from edit or new upload) */}
                {imageUrl && imagetype ? (
                    imagetype.startsWith('video/') ? (
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
                                        ×
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

                    {['vector', 'psd', 'templates', 'mockups'].includes(category) && (
                        <div className="upload-field">
                            <label className="upload-label">Upload Zip File</label>
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

                    <UploadBtn />
                </div>
            </div>
        </div>
    );
}

export default UploadBanner1;
