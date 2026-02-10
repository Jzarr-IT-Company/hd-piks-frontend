import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import FilterationImages from '../Components/FilterationImages/FilterationImages';
import { getAllImages } from '../Services/getImages';
import { fetchCategories } from '../Services/category';
import HomeBannerSearchFilterationCompo2 from '../Components/HomeBannerSearchFilterationCompo2/HomeBannerSearchFilterationCompo2';
import AppFooter from '../Components/AppFooter/AppFooter'; // NEW
import { Link } from "react-router-dom"; // if not already imported
import logo from "../assets/logo1.webp";
function SearchPage() {
  // :term from /search/:term  e.g. "wallpapers"
  const { term } = useParams();
  const [resolvedCategory, setResolvedCategory] = useState(null); // parent category name (e.g. "Image")
  const [presetSubcategory, setPresetSubcategory] = useState('all'); // subcategory name (e.g. "wallpapers")
  const [presetSubSubcategory, setPresetSubSubcategory] = useState('all'); // NEW
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subSubcategoryNames, setSubSubcategoryNames] = useState([]); // NEW

  const normalize = useCallback(
    (val) => {
      if (typeof val === 'string') return val.trim().toLowerCase();
      if (val == null) return '';
      return String(val).trim().toLowerCase();
    },
    []
  );

  const getCategoryName = useCallback(
    (cat) => {
      if (!cat) return '';
      if (typeof cat === 'string') return cat;
      if (typeof cat === 'object') return cat.name || '';
      return String(cat);
    },
    []
  );

  const getSubcategoryName = useCallback(
    (sub) => {
      if (!sub) return '';
      if (typeof sub === 'string') return sub;
      if (typeof sub === 'object') return sub.name || '';
      return String(sub);
    },
    []
  );

  const getSubSubcategoryName = useCallback(
    (subsub) => {
      if (!subsub) return '';
      if (typeof subsub === 'string') return subsub;
      if (typeof subsub === 'object') return subsub.name || '';
      return String(subsub);
    },
    []
  );

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!term) {
        setResolvedCategory(null);
        setPresetSubcategory('all');
        setPresetSubSubcategory('all');
        setNotFound(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      setNotFound(false);
      try {
        // Fetch all approved images from DB
        const images = await getAllImages();
        if (!active) return;

        const approved = images.filter(
          (item) => item.approved === true && item.rejected !== true
        );

        const target = normalize(term);

        let chosen = null;
        let matchedSub = false;
        let matchedSubSub = false;

        // 1) Match by subcategory name (e.g. "wallpapers")
        let matchSub = approved.find(
          (img) => normalize(getSubcategoryName(img.subcategory)) === target
        );
        if (matchSub) {
          chosen = matchSub;
          matchedSub = true;
        }

        // 2) If not, match by sub‑subcategory name (e.g. "nature wallpaper")
        if (!chosen) {
          let matchSubSub = approved.find(
            (img) => normalize(getSubSubcategoryName(img.subsubcategory)) === target
          );
          if (matchSubSub) {
            chosen = matchSubSub;
            matchedSubSub = true;
          }
        }

        // 3) Fallback: keyword/title/description
        if (!chosen) {
          chosen = approved.find((img) => {
            const title = normalize(img.title);
            const desc = normalize(img.description);
            const kws = Array.isArray(img.keywords) ? img.keywords : [];
            return (
              title.includes(target) ||
              desc.includes(target) ||
              kws.some((k) => normalize(k) === target)
            );
          });
        }

        if (!chosen) {
          setResolvedCategory(null);
          setPresetSubcategory('all');
          setPresetSubSubcategory('all');
          setNotFound(true);
          return;
        }

        const parentCatName = getCategoryName(chosen.category);
        const subcatName = getSubcategoryName(chosen.subcategory);
        const subSubName = getSubSubcategoryName(chosen.subsubcategory);

        const normSub = normalize(subcatName);
        const normSubSub = normalize(subSubName);

        let nextSubSub = 'all';
        if (
          matchedSubSub ||
          (subSubName && target === normSubSub)
        ) {
          nextSubSub = subSubName;
        }

        setResolvedCategory(parentCatName || null);
        setPresetSubcategory(subcatName || 'all');
        setPresetSubSubcategory(nextSubSub || 'all');
        setNotFound(false);
      } catch (err) {
        console.error('[SearchPage] Failed to resolve search term', err);
        if (!active) return;
        setResolvedCategory(null);
        setPresetSubcategory('all');
        setPresetSubSubcategory('all');
        setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [term, normalize, getCategoryName, getSubcategoryName, getSubSubcategoryName]);

  // NEW: load real sub‑subcategories (children of the matched subcategory) from category tree
  useEffect(() => {
    let active = true;
    const loadSubs = async () => {
      if (!resolvedCategory || !presetSubcategory || presetSubcategory === 'all') {
        setSubSubcategoryNames([]);
        return;
      }
      try {
        const cats = await fetchCategories(true);
        if (!active || !Array.isArray(cats)) return;
        const parent = cats.find((c) => normalize(c.name) === normalize(resolvedCategory));
        const sub = parent?.children?.find(
          (c) => normalize(c.name) === normalize(presetSubcategory)
        );
        const children = sub?.children || [];
        setSubSubcategoryNames(children.map((c) => c.name).filter(Boolean));
      } catch (e) {
        console.error('[SearchPage] load sub-subcategories failed', e);
        if (active) setSubSubcategoryNames([]);
      }
    };
    loadSubs();
    return () => {
      active = false;
    };
  }, [resolvedCategory, presetSubcategory, normalize]);

  const prettyTerm = term ? term.replace(/-/g, ' ') : '';

  return (
    <>
      {/* Search bar from homepage, visible on desktop as well */}
     <div className="container pt-4">
      <div className="d-flex align-items-center">
        <Link to="/">
          <img
            src={logo}
            alt="Hdpiks"
            style={{ height: 40, cursor: 'pointer' }}
          />
        </Link>

        <div className="flex-grow-1 ms-3">
          {/* Search bar from homepage, visible on desktop as well */}
          <HomeBannerSearchFilterationCompo2 showOnDesktop />
        </div>
      </div>
    </div>

      <div className="container py-4">

        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 text-center text-md-start">
          <div className="w-100">
            <h2 className="h4 mb-1">
              Results for <span className="text-primary">“{prettyTerm || 'All'}”</span>
            </h2>
            {resolvedCategory && (
              <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                Showing assets under <strong>{resolvedCategory}</strong>
                {presetSubcategory && presetSubcategory !== 'all'
                  ? ` · subcategory “${presetSubcategory}”`
                  : ''}
                {presetSubSubcategory && presetSubSubcategory !== 'all'
                  ? ` · style “${presetSubSubcategory}”`
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
        ) : notFound || !resolvedCategory ? (
          <div className="mt-4">
            <p className="text-muted mb-2">
              No assets found for “{prettyTerm}”. Try a different keyword or browse categories.
            </p>
          </div>
        ) : (
          <FilterationImages
            name={normalize(resolvedCategory)}
            presetSubcategory={presetSubcategory || 'all'}
            searchSubcategory={presetSubcategory || term}
            subSubcategoryNames={subSubcategoryNames} // NEW
            // NEW: restrict to a specific sub‑subcategory when term matches it
            searchSubSubcategory={presetSubSubcategory !== 'all' ? presetSubSubcategory : undefined}
          />
        )}
      </div>

      {/* Keep same footer as home page */}
      <AppFooter />
    </>
  );
}

export default SearchPage;