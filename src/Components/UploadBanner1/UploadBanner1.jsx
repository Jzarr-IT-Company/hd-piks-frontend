import React, { useState, useEffect, useMemo, useRef } from 'react';
import './UploadBanner1.css';
import { fetchCategories } from '../../Services/category';
import { multipartUploadToS3 } from '../../Services/S3Service';
import UploadBanner1ImageCompo from '../UploadBanner1ImageCompo/UploadBanner1ImageCompo';
import { useUpload } from '../../Context/UploadContext';
import { useAuth } from '../../Context/AuthContext';
import UploadBtn from '../UploadBtn/UploadBtn';
import { message, Spin } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';

function UploadBanner1() {
    const ZIP_MODE_HIDDEN = 'hidden';
    const ZIP_MODE_OPTIONAL = 'optional';
    const ZIP_MODE_REQUIRED = 'required';
    const LEGACY_ZIP_REQUIRED_NAMES = ['mockups', 'vector', 'psd', 'templates', 'icons', 'nft'];
    const LEGACY_ZIP_OPTIONAL_NAMES = ['image'];
    const MIN_ZIP_BYTES = 1 * 1024 * 1024; // 1MB
    const MAX_ZIP_BYTES = 500 * 1024 * 1024; // 500MB
    const DEFAULT_ZIP_ALLOWED_MIME_TYPES = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
    const formatBytesAsMb = (bytes) => {
        const numeric = Number(bytes || 0);
        if (!Number.isFinite(numeric) || numeric <= 0) return '0 MB';
        const mb = numeric / (1024 * 1024);
        const rounded = mb >= 10 ? mb.toFixed(0) : mb.toFixed(2).replace(/\.00$/, '');
        return `${rounded} MB`;
    };
    const formatSizeHint = (bytes) => `${formatBytesAsMb(bytes)} (${bytes} bytes)`;

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
        imageUrl,
        setImageUrl,
        imageType,
        setImageType,
        setImageSize,
        setS3Keys,
        setS3Urls,
        setFileMetadata,
        setImageData,
    } = useUpload();
    const { creatorData } = useAuth();

    const [loading, setLoading] = useState(false);
    const [keywordInput, setKeywordInput] = useState('');
    const [categoryTree, setCategoryTree] = useState([]);
    const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
    const [isSubSubCategoryOpen, setIsSubSubCategoryOpen] = useState(false);
    const [subCategorySearchQuery, setSubCategorySearchQuery] = useState('');
    const [subSubCategorySearchQuery, setSubSubCategorySearchQuery] = useState('');
    const subCategoryDropdownRef = useRef(null);
    const subSubCategoryDropdownRef = useRef(null);
    const subCategorySearchInputRef = useRef(null);
    const subSubCategorySearchInputRef = useRef(null);
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
    const filteredSubCategories = useMemo(() => {
        const needle = String(subCategorySearchQuery || '').trim().toLowerCase();
        if (!needle) return subCategories;
        return subCategories.filter((item) => String(item?.name || '').toLowerCase().includes(needle));
    }, [subCategories, subCategorySearchQuery]);
    const filteredSubSubCategories = useMemo(() => {
        const needle = String(subSubCategorySearchQuery || '').trim().toLowerCase();
        if (!needle) return subSubCategories;
        return subSubCategories.filter((item) => String(item?.name || '').toLowerCase().includes(needle));
    }, [subSubCategories, subSubCategorySearchQuery]);

    const selectedNames = useMemo(() => {
        return [
            selectedCategoryNode?.name,
            selectedSubCategoryNode?.name,
            selectedSubSubCategoryNode?.name,
        ]
            .filter(Boolean)
            .map((name) => name.trim().toLowerCase());
    }, [selectedCategoryNode, selectedSubCategoryNode, selectedSubSubCategoryNode]);

    const effectiveUploadPolicy = useMemo(() => {
        const parseNodePolicy = (node) => {
            if (!node || typeof node !== 'object') return null;
            const allowedMimeTypes = Array.isArray(node.allowedMimeTypes)
                ? [...new Set(node.allowedMimeTypes.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean))]
                : [];
            const minFileSizeBytes =
                node.minFileSizeBytes !== null && node.minFileSizeBytes !== undefined && node.minFileSizeBytes !== ''
                    ? Number(node.minFileSizeBytes)
                    : null;
            const maxFileSizeBytes =
                node.maxFileSizeBytes !== null && node.maxFileSizeBytes !== undefined && node.maxFileSizeBytes !== ''
                    ? Number(node.maxFileSizeBytes)
                    : null;
            const hasRules =
                allowedMimeTypes.length > 0 ||
                Number.isFinite(minFileSizeBytes) ||
                Number.isFinite(maxFileSizeBytes);
            if (!hasRules) return null;
            return {
                sourceName: node.name || 'selected category',
                allowedMimeTypes,
                minFileSizeBytes: Number.isFinite(minFileSizeBytes) ? minFileSizeBytes : null,
                maxFileSizeBytes: Number.isFinite(maxFileSizeBytes) ? maxFileSizeBytes : null,
            };
        };

        return (
            parseNodePolicy(selectedSubSubCategoryNode) ||
            parseNodePolicy(selectedSubCategoryNode) ||
            parseNodePolicy(selectedCategoryNode) ||
            null
        );
    }, [selectedCategoryNode, selectedSubCategoryNode, selectedSubSubCategoryNode]);

    const effectiveZipPolicy = useMemo(() => {
        const parseNodeZipPolicy = (node) => {
            if (!node || typeof node !== 'object') return null;
            const normalizedMode = ['hidden', 'optional', 'required'].includes(String(node.zipMode || '').toLowerCase())
                ? String(node.zipMode).toLowerCase()
                : '';
            const allowedMimeTypes = Array.isArray(node.zipAllowedMimeTypes)
                ? [...new Set(node.zipAllowedMimeTypes.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean))]
                : [];
            const minFileSizeBytes =
                node.zipMinFileSizeBytes !== null && node.zipMinFileSizeBytes !== undefined && node.zipMinFileSizeBytes !== ''
                    ? Number(node.zipMinFileSizeBytes)
                    : null;
            const maxFileSizeBytes =
                node.zipMaxFileSizeBytes !== null && node.zipMaxFileSizeBytes !== undefined && node.zipMaxFileSizeBytes !== ''
                    ? Number(node.zipMaxFileSizeBytes)
                    : null;
            const hasRules =
                Boolean(normalizedMode) ||
                allowedMimeTypes.length > 0 ||
                Number.isFinite(minFileSizeBytes) ||
                Number.isFinite(maxFileSizeBytes);
            if (!hasRules) return null;
            return {
                sourceName: node.name || 'selected category',
                zipMode: normalizedMode || ZIP_MODE_OPTIONAL,
                allowedMimeTypes: allowedMimeTypes.length ? allowedMimeTypes : DEFAULT_ZIP_ALLOWED_MIME_TYPES,
                minFileSizeBytes: Number.isFinite(minFileSizeBytes) ? minFileSizeBytes : MIN_ZIP_BYTES,
                maxFileSizeBytes: Number.isFinite(maxFileSizeBytes) ? maxFileSizeBytes : MAX_ZIP_BYTES,
            };
        };

        const explicitPolicy =
            parseNodeZipPolicy(selectedSubSubCategoryNode) ||
            parseNodeZipPolicy(selectedSubCategoryNode) ||
            parseNodeZipPolicy(selectedCategoryNode);
        if (explicitPolicy) return explicitPolicy;

        const legacyMode = selectedNames.some((name) => LEGACY_ZIP_REQUIRED_NAMES.includes(name))
            ? ZIP_MODE_REQUIRED
            : selectedNames.some((name) => LEGACY_ZIP_OPTIONAL_NAMES.includes(name))
                ? ZIP_MODE_OPTIONAL
                : ZIP_MODE_HIDDEN;
        return {
            sourceName: selectedSubSubCategoryNode?.name || selectedSubCategoryNode?.name || selectedCategoryNode?.name || 'selected category',
            zipMode: legacyMode,
            allowedMimeTypes: DEFAULT_ZIP_ALLOWED_MIME_TYPES,
            minFileSizeBytes: MIN_ZIP_BYTES,
            maxFileSizeBytes: MAX_ZIP_BYTES,
        };
    }, [selectedCategoryNode, selectedSubCategoryNode, selectedSubSubCategoryNode, selectedNames]);

    const isZipRequired = effectiveZipPolicy.zipMode === ZIP_MODE_REQUIRED;
    const isZipVisible = effectiveZipPolicy.zipMode !== ZIP_MODE_HIDDEN;

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

    const currentZipSize = useMemo(() => {
        const first = Array.isArray(zipFolder) ? zipFolder[0] : zipFolder;
        if (!first || typeof first !== 'object') return null;
        const size = Number(first.fileSize || 0);
        return Number.isFinite(size) && size > 0 ? size : null;
    }, [zipFolder]);

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
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                subCategoryDropdownRef.current &&
                !subCategoryDropdownRef.current.contains(event.target)
            ) {
                setIsSubCategoryOpen(false);
            }
            if (
                subSubCategoryDropdownRef.current &&
                !subSubCategoryDropdownRef.current.contains(event.target)
            ) {
                setIsSubSubCategoryOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsSubCategoryOpen(false);
                setIsSubSubCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);
    useEffect(() => {
        if (!subCategories.length) {
            setIsSubCategoryOpen(false);
            setSubCategorySearchQuery('');
        }
    }, [subCategories]);
    useEffect(() => {
        if (!subSubCategories.length) {
            setIsSubSubCategoryOpen(false);
            setSubSubCategorySearchQuery('');
        }
    }, [subSubCategories]);
    useEffect(() => {
        if (isSubCategoryOpen) {
            requestAnimationFrame(() => {
                subCategorySearchInputRef.current?.focus();
            });
        }
    }, [isSubCategoryOpen]);
    useEffect(() => {
        if (isSubSubCategoryOpen) {
            requestAnimationFrame(() => {
                subSubCategorySearchInputRef.current?.focus();
            });
        }
    }, [isSubSubCategoryOpen]);

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
        setIsSubCategoryOpen(false);
        setIsSubSubCategoryOpen(false);
        setSubCategorySearchQuery('');
        setSubSubCategorySearchQuery('');
    };
    const handleSubCategoryChange = (selectedId) => {
        setSelectedSubCategory(selectedId);
        const parentCat = categoryTree.find(c => c._id === category);
        const selectedSubCat = parentCat?.children?.find(c => c._id === selectedId);
        const subSubCats = selectedSubCat?.children || [];
        setSubSubCategories(subSubCats);
        setSelectedSubSubCategory('');
        setIsSubCategoryOpen(false);
        setIsSubSubCategoryOpen(false);
        setSubCategorySearchQuery('');
        setSubSubCategorySearchQuery('');
    };
    const handleSubSubCategoryChange = (selectedId) => {
        setSelectedSubSubCategory(selectedId);
        setIsSubSubCategoryOpen(false);
        setSubSubCategorySearchQuery('');
    };

    const handleTermsChange = () => {
        setTermsChecked(!termsChecked);
    };

    const handleContentChange = () => {
        setContentChecked(!contentChecked);
    };

    const handleZipFolders = async (file) => {
        if (!file) return;
        const isZipFile = file.name?.toLowerCase().endsWith('.zip');
        if (!isZipFile) {
            message.error('Only .zip file is allowed.');
            return;
        }
        const policyMinSize = Number.isFinite(Number(effectiveZipPolicy?.minFileSizeBytes))
            ? Number(effectiveZipPolicy.minFileSizeBytes)
            : MIN_ZIP_BYTES;
        const policyMaxSize = Number.isFinite(Number(effectiveZipPolicy?.maxFileSizeBytes))
            ? Number(effectiveZipPolicy.maxFileSizeBytes)
            : MAX_ZIP_BYTES;
        const policyMimeAllowList = Array.isArray(effectiveZipPolicy?.allowedMimeTypes)
            ? effectiveZipPolicy.allowedMimeTypes
            : [];
        const normalizedBrowserMime = String(file.type || '').trim().toLowerCase();
        if (normalizedBrowserMime && policyMimeAllowList.length && !policyMimeAllowList.includes(normalizedBrowserMime)) {
            message.error(
                `ZIP type ${normalizedBrowserMime} is not allowed. Allowed formats: ${policyMimeAllowList.join(', ')}.`
            );
            return;
        }
        if (file.size < policyMinSize) {
            message.error(`ZIP too small. Minimum ${formatSizeHint(policyMinSize)} required.`);
            return;
        }
        if (file.size > policyMaxSize) {
            message.error(`ZIP too large. Maximum ${formatSizeHint(policyMaxSize)} allowed.`);
            return;
        }
        setLoading(true);
        try {
            const result = await multipartUploadToS3(file, category, () => {});
            setZipFolderUrl(result.s3Url);
            setZipFolder([{
                s3Key: result.s3Key,
                url: result.s3Url,
                fileName: result.fileName || file.name,
                fileSize: result.fileSize || file.size,
                mimeType: result.mimeType || file.type || 'application/zip',
            }]);
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
                <UploadBanner1ImageCompo
                    selectedCategoryName={selectedCategoryNode?.name || ''}
                    uploadPolicy={effectiveUploadPolicy}
                />
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
                            <div
                                className={`upload-searchable-select ${isSubCategoryOpen ? 'is-open' : ''}`}
                                ref={subCategoryDropdownRef}
                            >
                                <button
                                    type="button"
                                    id="subCategorySelect"
                                    className="form-select upload-control upload-searchable-select__trigger"
                                    onClick={() => {
                                        setIsSubCategoryOpen((prev) => !prev);
                                        setIsSubSubCategoryOpen(false);
                                        setSubCategorySearchQuery('');
                                    }}
                                >
                                    <span className={selectedSubCategory ? '' : 'upload-searchable-select__placeholder'}>
                                        {selectedSubCategoryNode?.name || 'Select Sub-Category'}
                                    </span>
                                    <span className="upload-searchable-select__arrow" aria-hidden="true">
                                        ▼
                                    </span>
                                </button>
                                {isSubCategoryOpen ? (
                                    <div className="upload-searchable-select__menu">
                                        <input
                                            ref={subCategorySearchInputRef}
                                            type="text"
                                            className="form-control upload-searchable-select__search"
                                            placeholder="Type to filter..."
                                            value={subCategorySearchQuery}
                                            onChange={(event) => setSubCategorySearchQuery(event.target.value)}
                                        />
                                        <div className="upload-searchable-select__list" role="listbox">
                                            {filteredSubCategories.length ? (
                                                filteredSubCategories.map((subCat) => (
                                                    <button
                                                        type="button"
                                                        key={subCat._id}
                                                        className={`upload-searchable-select__option ${selectedSubCategory === subCat._id ? 'is-selected' : ''}`}
                                                        onClick={() => handleSubCategoryChange(subCat._id)}
                                                    >
                                                        {subCat.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="upload-searchable-select__empty">No sub-categories found</div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {subSubCategories.length > 0 && (
                        <div className="upload-field">
                            <label className="upload-label">Select Sub-Sub-Category</label>
                            <div
                                className={`upload-searchable-select ${isSubSubCategoryOpen ? 'is-open' : ''}`}
                                ref={subSubCategoryDropdownRef}
                            >
                                <button
                                    type="button"
                                    id="subSubCategorySelect"
                                    className="form-select upload-control upload-searchable-select__trigger"
                                    onClick={() => {
                                        setIsSubSubCategoryOpen((prev) => !prev);
                                        setIsSubCategoryOpen(false);
                                        setSubSubCategorySearchQuery('');
                                    }}
                                >
                                    <span className={selectedSubSubCategory ? '' : 'upload-searchable-select__placeholder'}>
                                        {selectedSubSubCategoryNode?.name || 'Select Sub-Sub-Category'}
                                    </span>
                                    <span className="upload-searchable-select__arrow" aria-hidden="true">
                                        ▼
                                    </span>
                                </button>
                                {isSubSubCategoryOpen ? (
                                    <div className="upload-searchable-select__menu">
                                        <input
                                            ref={subSubCategorySearchInputRef}
                                            type="text"
                                            className="form-control upload-searchable-select__search"
                                            placeholder="Type to filter..."
                                            value={subSubCategorySearchQuery}
                                            onChange={(event) => setSubSubCategorySearchQuery(event.target.value)}
                                        />
                                        <div className="upload-searchable-select__list" role="listbox">
                                            {filteredSubSubCategories.length ? (
                                                filteredSubSubCategories.map((subSubCat) => (
                                                    <button
                                                        type="button"
                                                        key={subSubCat._id}
                                                        className={`upload-searchable-select__option ${selectedSubSubCategory === subSubCat._id ? 'is-selected' : ''}`}
                                                        onClick={() => handleSubSubCategoryChange(subSubCat._id)}
                                                    >
                                                        {subSubCat.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="upload-searchable-select__empty">No sub-sub-categories found</div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
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
                                    {currentZipSize ? (
                                        <span> ({formatBytesAsMb(currentZipSize)})</span>
                                    ) : null}
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
                            <div className="small text-muted mt-1">
                                Allowed ZIP size: {formatSizeHint(effectiveZipPolicy?.minFileSizeBytes ?? MIN_ZIP_BYTES)} to {formatSizeHint(effectiveZipPolicy?.maxFileSizeBytes ?? MAX_ZIP_BYTES)}
                            </div>
                            {effectiveZipPolicy?.allowedMimeTypes?.length ? (
                                <div className="small text-muted mt-1">
                                    Allowed ZIP formats: {effectiveZipPolicy.allowedMimeTypes.join(', ')}
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="upload-terms">
                        <label className="upload-terms__item">
                            <input type="checkbox" checked={termsChecked} onChange={handleTermsChange} />
                            <span>
                                <Link className="text-primary text-decoration-underline" to={'/company/help-center'}>
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

                    <UploadBtn isZipRequired={isZipRequired} uploadPolicy={effectiveUploadPolicy} zipPolicy={effectiveZipPolicy} />
                </div>
            </div>
        </div>
    );
}

export default UploadBanner1;

