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
import {
    resolveCategoryFromSlug,
    resolveSubcategoryFromSlug,
    slugifyCategory,
} from '../../utils/navbarMenuConfig.js';

function Sidebar() {
    const [categoryname, setCategoryName] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [presetSubcategory, setPresetSubcategory] = useState('all');
    const [collectionAssetIds, setCollectionAssetIds] = useState(null);
    const { name, parentSlug, subSlug } = useParams();
    const [searchParams] = useSearchParams();
    const collectionSlug = searchParams.get('collection');             // NEW
    const discoverMode = searchParams.get('discover') === '1' && !collectionSlug;
    const discoverSubcategory = searchParams.get('dsSub') || '';
    const discoverSubSubcategory = searchParams.get('dsSubSub') || '';
    const categoriesQuery = usePublicCategoriesQuery();

    // Resolve route params to backend category names using cached /categories query.
    useEffect(() => {
        const routeCategory = parentSlug || name;
        if (!routeCategory) return;
        const tree = categoriesQuery.data;
        if (!Array.isArray(tree) || !tree.length) {
            if (categoriesQuery.isError) {
                setCategoryName(routeCategory);
                setPresetSubcategory('all');
            }
            return;
        }

        if (parentSlug) {
            const parentResolved = resolveCategoryFromSlug(tree, parentSlug);
            const parentCategory = parentResolved.category;
            setCategoryName(parentResolved.label);

            if (subSlug) {
                const subcategory = resolveSubcategoryFromSlug(parentCategory, subSlug);
                setPresetSubcategory(subcategory?.name || subSlug);
            } else {
                setPresetSubcategory('all');
            }
            return;
        }

        const normalizedName = slugifyCategory(name);
        const parentMatch = tree.find((p) => slugifyCategory(p.slug || p.name) === normalizedName);
        if (parentMatch) {
            setCategoryName(parentMatch.name);
            setPresetSubcategory('all');
            return;
        }

        for (const parent of tree) {
            if (!Array.isArray(parent.children)) continue;
            const child = parent.children.find((c) => slugifyCategory(c.slug || c.name) === normalizedName);
            if (child) {
                setCategoryName(parent.name);
                setPresetSubcategory(child.name);
                return;
            }
        }

        setCategoryName(name);
        setPresetSubcategory('all');
    }, [name, parentSlug, subSlug, categoriesQuery.data, categoriesQuery.isError]);

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

    // Load available subcategories from cached taxonomy instead of the heavy full-assets endpoint.
    useEffect(() => {
        const tree = categoriesQuery.data;
        if (!categoryname || !Array.isArray(tree)) {
            setSubcategories([]);
            return;
        }

        const parent = tree.find(
            (item) => String(item?.name || '').toLowerCase() === String(categoryname || '').toLowerCase()
        );

        const nextSubcategories = Array.isArray(parent?.children)
            ? parent.children.map((child) => child?.name).filter(Boolean)
            : [];

        setSubcategories(nextSubcategories);
    }, [categoryname, categoriesQuery.data]);

    const handleCategoryChange = (category) => {
        setCategoryName(category);
    };

    return (
        <>
            <TopNavOnly />
            <div className="container top-nav-content sidebar-searchbar-wrap">
                <HomeBannerSearchFilterationCompo2 showOnDesktop hideSearchBarMargin hideWrapperPadding hideSuggestions />
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
