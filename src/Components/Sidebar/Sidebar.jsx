import React, { useEffect, useState } from 'react';
import FilterationComponent from '../FilterationComponent/FilterationComponent';
import FilterationImages from '../FilterationImages/FilterationImages';
import HomeBannerSearchFilterationCompo2 from '../HomeBannerSearchFilterationCompo2/HomeBannerSearchFilterationCompo2';
import { useParams, useSearchParams } from 'react-router-dom';
import TopNavOnly from '../AppNavbar/TopNavOnly';
import './Sidebar.css';
import api from '../../Services/api';
import { API_ENDPOINTS } from '../../config/api.config';
import { usePublicCategoriesQuery } from '../../query/categoryQueries.js';

function Sidebar() {
    const [categoryname, setCategoryName] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [presetSubcategory, setPresetSubcategory] = useState('all');
    const [collectionAssetIds, setCollectionAssetIds] = useState(null);
    const { name } = useParams();
    const [searchParams] = useSearchParams();
    const collectionSlug = searchParams.get('collection');             // NEW
    const discoverMode = searchParams.get('discover') === '1' && !collectionSlug;
    const discoverSubcategory = searchParams.get('dsSub') || '';
    const discoverSubSubcategory = searchParams.get('dsSubSub') || '';
    const categoriesQuery = usePublicCategoriesQuery();

    // Resolve route param 'name' to parent or subcategory using cached /categories query
    useEffect(() => {
        if (!name) return;
        const tree = categoriesQuery.data;
        if (!Array.isArray(tree) || !tree.length) {
            if (categoriesQuery.isError) {
                setCategoryName(name);
                setPresetSubcategory('all');
            }
            return;
        }

        const lower = name.toLowerCase();
        const parentMatch = tree.find((p) => p.name?.toLowerCase() === lower);
        if (parentMatch) {
            setCategoryName(parentMatch.name);
            setPresetSubcategory('all');
            return;
        }

        for (const parent of tree) {
            if (!Array.isArray(parent.children)) continue;
            const child = parent.children.find((c) => c.name?.toLowerCase() === lower);
            if (child) {
                setCategoryName(parent.name);
                setPresetSubcategory(child.name);
                return;
            }
        }

        setCategoryName(name);
        setPresetSubcategory('all');
    }, [name, categoriesQuery.data, categoriesQuery.isError]);

    // When a collection slug is present, load that collection and
    // restrict results to its assetIds.
    useEffect(() => {
        if (!collectionSlug) {
            setCollectionAssetIds(null);
            return;
        }

        const loadCollection = async () => {
            try {
                const res = await api.get(
                    API_ENDPOINTS.SUBCATEGORY_COLLECTION_BY_SLUG(collectionSlug)
                );
                const col = res.data?.data;
                if (!col) {
                    setCollectionAssetIds(null);
                    return;
                }

                // Override category + preset subcategory from collection definition
                if (col.parentCategory?.name) {
                    setCategoryName(col.parentCategory.name);
                }
                if (col.subcategory?.name) {
                    setPresetSubcategory(col.subcategory.name);
                }

                const ids = Array.isArray(col.assetIds)
                    ? col.assetIds.map((a) => (a._id || a).toString())
                    : [];
                setCollectionAssetIds(ids);
            } catch (err) {
                console.error('Sidebar: failed to load collection by slug', err);
                setCollectionAssetIds(null);
            }
        };

        loadCollection();
    }, [collectionSlug]);

    // Load available subcategories for current category from images
    useEffect(() => {
        const fetchSubs = async () => {
            try {
                const res = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
                const raw = res.data?.data || [];

                const approved = raw.filter(
                    (item) => item.approved === true && item.rejected !== true
                );

                const filtered = approved.filter((item) => {
                    const cat = item.category;
                    const catName =
                        typeof cat === 'string'
                            ? cat
                            : (cat && cat.name) || '';
                    return catName.toLowerCase() === (categoryname || '').toLowerCase();
                });

                const uniqueSubs = Array.from(
                    new Set(
                        filtered
                            .map((item) => {
                                const sub = item.subcategory;
                                return typeof sub === 'string'
                                    ? sub
                                    : (sub && sub.name) || '';
                            })
                            .filter(Boolean)
                    )
                );

                setSubcategories(uniqueSubs);
            } catch (err) {
                console.error('Failed to load subcategories', err.message);
                setSubcategories([]);
            }
        };

        if (categoryname) {
            fetchSubs();
        }
    }, [categoryname]);

    const handleCategoryChange = (category) => {
        setCategoryName(category);
    };

    return (
        <>
            <TopNavOnly />
            <div className="container top-nav-content sidebar-searchbar-wrap">
                <HomeBannerSearchFilterationCompo2 showOnDesktop hideSearchBarMargin hideWrapperPadding />
            </div>

            <div className="sidebar-main mb-0">
                <div className="sidebar-content">
                    <FilterationComponent
                        changeCategory={handleCategoryChange}
                        subcategories={subcategories}
                        onSelectSubcategory={(sub) => setPresetSubcategory(sub)}
                        categoryname={categoryname}
                    />

                    {/* <h2 className='fw-semibold mt-4'>
                        Results for "<span className='fw-bold'>{headingLabel}</span>"
                    </h2> */}

                    <FilterationImages
                        name={categoryname}
                        presetSubcategory={presetSubcategory}
                        collectionAssetIds={collectionAssetIds}
                        searchSubcategory={discoverMode ? discoverSubcategory : undefined}
                        searchSubSubcategory={discoverMode ? discoverSubSubcategory : undefined}
                        similarMatchMode={discoverMode}
                        showFooter
                    />
                </div>
            </div>
        </>
    );
}

export default Sidebar;
