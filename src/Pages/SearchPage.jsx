import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import FilterationImages from '../Components/FilterationImages/FilterationImages';
import HomeBannerSearchFilterationCompo2 from '../Components/HomeBannerSearchFilterationCompo2/HomeBannerSearchFilterationCompo2';
import AppFooter from '../Components/AppFooter/AppFooter';
import { Link } from 'react-router-dom';
import logo from '../assets/logo1.webp';
import { useAllImagesQuery } from '../query/imageQueries.js';
import { usePublicCategoriesQuery } from '../query/categoryQueries.js';
import { QueryErrorRetry } from '../Components/QueryState/QueryState.jsx';

function SearchPage() {
  const { term } = useParams();
  const [resolvedCategory, setResolvedCategory] = useState(null);
  const [presetSubcategory, setPresetSubcategory] = useState('all');
  const [presetSubSubcategory, setPresetSubSubcategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subSubcategoryNames, setSubSubcategoryNames] = useState([]);

  const imagesQuery = useAllImagesQuery(true);
  const categoriesQuery = usePublicCategoriesQuery();

  const normalize = useCallback((val) => {
    if (typeof val === 'string') return val.trim().toLowerCase();
    if (val == null) return '';
    return String(val).trim().toLowerCase();
  }, []);

  const getCategoryName = useCallback((cat) => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object') return cat.name || '';
    return String(cat);
  }, []);

  const getSubcategoryName = useCallback((sub) => {
    if (!sub) return '';
    if (typeof sub === 'string') return sub;
    if (typeof sub === 'object') return sub.name || '';
    return String(sub);
  }, []);

  const getSubSubcategoryName = useCallback((subsub) => {
    if (!subsub) return '';
    if (typeof subsub === 'string') return subsub;
    if (typeof subsub === 'object') return subsub.name || '';
    return String(subsub);
  }, []);

  useEffect(() => {
    const run = () => {
      if (!term) {
        setResolvedCategory(null);
        setPresetSubcategory('all');
        setPresetSubSubcategory('all');
        setNotFound(false);
        setLoading(false);
        return;
      }

      if (imagesQuery.isLoading) {
        setLoading(true);
        return;
      }

      setLoading(true);
      setNotFound(false);

      if (imagesQuery.isError) {
        setResolvedCategory(null);
        setPresetSubcategory('all');
        setPresetSubSubcategory('all');
        setNotFound(true);
        setLoading(false);
        return;
      }

      const images = imagesQuery.data || [];
      const approved = images.filter((item) => item.approved === true && item.rejected !== true);
      const target = normalize(term);

      let chosen = null;
      let matchedSubSub = false;

      const matchSub = approved.find(
        (img) => normalize(getSubcategoryName(img.subcategory)) === target
      );
      if (matchSub) {
        chosen = matchSub;
      }

      if (!chosen) {
        const matchSubSub = approved.find(
          (img) => normalize(getSubSubcategoryName(img.subsubcategory)) === target
        );
        if (matchSubSub) {
          chosen = matchSubSub;
          matchedSubSub = true;
        }
      }

      if (!chosen) {
        chosen = approved.find((img) => {
          const title = normalize(img.title);
          const desc = normalize(img.description);
          const kws = Array.isArray(img.keywords) ? img.keywords : [];
          return title.includes(target) || desc.includes(target) || kws.some((k) => normalize(k) === target);
        });
      }

      if (!chosen) {
        setResolvedCategory(null);
        setPresetSubcategory('all');
        setPresetSubSubcategory('all');
        setNotFound(true);
        setLoading(false);
        return;
      }

      const parentCatName = getCategoryName(chosen.category);
      const subcatName = getSubcategoryName(chosen.subcategory);
      const subSubName = getSubSubcategoryName(chosen.subsubcategory);
      const normSubSub = normalize(subSubName);

      let nextSubSub = 'all';
      if (matchedSubSub || (subSubName && target === normSubSub)) {
        nextSubSub = subSubName;
      }

      setResolvedCategory(parentCatName || null);
      setPresetSubcategory(subcatName || 'all');
      setPresetSubSubcategory(nextSubSub || 'all');
      setNotFound(false);
      setLoading(false);
    };

    run();
  }, [
    term,
    imagesQuery.data,
    imagesQuery.isError,
    imagesQuery.isLoading,
    normalize,
    getCategoryName,
    getSubcategoryName,
    getSubSubcategoryName,
  ]);

  useEffect(() => {
    if (!resolvedCategory || !presetSubcategory || presetSubcategory === 'all') {
      setSubSubcategoryNames([]);
      return;
    }

    const cats = categoriesQuery.data || [];
    if (!Array.isArray(cats) || !cats.length) {
      if (categoriesQuery.isError) setSubSubcategoryNames([]);
      return;
    }

    const parent = cats.find((c) => normalize(c.name) === normalize(resolvedCategory));
    const sub = parent?.children?.find((c) => normalize(c.name) === normalize(presetSubcategory));
    const children = sub?.children || [];
    setSubSubcategoryNames(children.map((c) => c.name).filter(Boolean));
  }, [resolvedCategory, presetSubcategory, normalize, categoriesQuery.data, categoriesQuery.isError]);

  const prettyTerm = term ? term.replace(/-/g, ' ') : '';

  return (
    <>
      <div className="container pt-4">
        <div className="d-flex align-items-start d-md-none" style={{ gap: 10 }}>
          <Link to="/" style={{ marginTop: 2, flex: '0 0 auto' }}>
            <img src={logo} alt="Hdpiks" style={{ height: 36, cursor: 'pointer' }} />
          </Link>
          <div className="flex-grow-1">
            <HomeBannerSearchFilterationCompo2 showOnDesktop compact hideSearchBarMargin hideWrapperPadding />
          </div>
        </div>

        <div className="d-none d-md-flex align-items-start">
          <Link to="/" style={{ marginTop: -8, flex: '0 0 auto' }}>
            <img src={logo} alt="Hdpiks" style={{ height: 40, cursor: 'pointer' }} />
          </Link>

          <div className="flex-grow-1 ms-3">
            <HomeBannerSearchFilterationCompo2 showOnDesktop hideSearchBarMargin hideWrapperPadding />
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 text-center text-md-start">
          <div className="w-100">
            <h2 className="h4 mb-1">
              Results for <span className="text-primary">"{prettyTerm || 'All'}"</span>
            </h2>
            {resolvedCategory && (
              <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                Showing assets under <strong>{resolvedCategory}</strong>
                {presetSubcategory && presetSubcategory !== 'all'
                  ? ` · subcategory "${presetSubcategory}"`
                  : ''}
                {presetSubSubcategory && presetSubSubcategory !== 'all'
                  ? ` · style "${presetSubSubcategory}"`
                  : ''}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mb-4">
            <Skeleton variant="rectangular" width="100%" height={220} className="mb-3" />
            <div className="d-flex gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" width="100%" height={180} />
              ))}
            </div>
          </div>
        ) : imagesQuery.isError ? (
          <QueryErrorRetry
            message={imagesQuery.error?.response?.data?.message || imagesQuery.error?.message || 'Failed to load search data'}
            onRetry={() => imagesQuery.refetch()}
          />
        ) : notFound || !resolvedCategory ? (
          <div className="mt-4">
            <p className="text-muted mb-2">
              No assets found for "{prettyTerm}". Try a different keyword or browse categories.
            </p>
          </div>
        ) : (
          <FilterationImages
            name={normalize(resolvedCategory)}
            presetSubcategory={presetSubcategory || 'all'}
            searchSubcategory={presetSubcategory || term}
            subSubcategoryNames={subSubcategoryNames}
            searchSubSubcategory={presetSubSubcategory !== 'all' ? presetSubSubcategory : undefined}
          />
        )}
      </div>

      <AppFooter />
    </>
  );
}

export default SearchPage;
