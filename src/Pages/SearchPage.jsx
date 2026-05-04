import React, { useEffect, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import FilterationImages from '../Components/FilterationImages/FilterationImages';
import HomeBannerSearchFilterationCompo2 from '../Components/HomeBannerSearchFilterationCompo2/HomeBannerSearchFilterationCompo2';
import TopNavOnly from '../Components/AppNavbar/TopNavOnly';
import AppFooter from '../Components/AppFooter/AppFooter';
import { QueryErrorRetry } from '../Components/QueryState/QueryState.jsx';
import { useSearchAssetsQuery } from '../query/searchQueries.js';
import { useUI } from '../Context/UIContext.jsx';

const prettyFromSlug = (value = '') => decodeURIComponent(String(value || '')).replace(/-/g, ' ').trim();
const slugify = (value = '') => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

function SearchPage() {
  const { category, name, term } = useParams();
  const { setHomeBannerSearchbarFilteration } = useUI();

  const routeCategory = name ? prettyFromSlug(category || 'image') : 'Image';
  const keyword = prettyFromSlug(name || term || '');
  const categorySlug = slugify(routeCategory || 'image') || 'image';

  useEffect(() => {
    setHomeBannerSearchbarFilteration(routeCategory || 'Image');
  }, [routeCategory, setHomeBannerSearchbarFilteration]);

  const searchQuery = useSearchAssetsQuery({
    category: routeCategory,
    q: keyword,
    page: 1,
    enabled: Boolean(keyword),
  });

  const payload = searchQuery.data;
  const results = payload?.data || [];
  const exploreAssets = payload?.exploreAssets || [];
  const searchSuggestions = payload?.suggestions || [];
  const popularSubcategories = payload?.popularSubcategories || [];
  const resolvedCategory = payload?.resolved?.parentCategory || payload?.category || routeCategory;
  const matchedSubcategory = payload?.resolved?.matchedSubcategory || 'all';
  const matchedSubsubcategory = payload?.resolved?.matchedSubsubcategory || 'all';

  const emptySuggestions = useMemo(() => {
    const categoryLabel = resolvedCategory || routeCategory || 'Image';
    const taxonomySuggestions = [...searchSuggestions, ...popularSubcategories]
      .filter((item) => item?.label || item?.value)
      .slice(0, 4)
      .map((item) => ({
        label: item.label || item.value,
        to: `/search/${encodeURIComponent(slugify(categoryLabel) || 'image')}/${encodeURIComponent(item.value || item.label)}`,
      }));

    return [
      ...taxonomySuggestions,
      { label: `Explore ${categoryLabel}`, to: `/collection/${encodeURIComponent(slugify(categoryLabel) || 'image')}` },
      { label: 'Search Images', to: `/search/image/${encodeURIComponent(keyword)}` },
      { label: 'Browse Videos', to: `/search/video/${encodeURIComponent(keyword)}` },
    ].slice(0, 6);
  }, [keyword, resolvedCategory, routeCategory, searchSuggestions, popularSubcategories]);

  if (term && !name) {
    return <Navigate to={`/search/image/${encodeURIComponent(term)}`} replace />;
  }

  return (
    <>
      <TopNavOnly />
      <div className="container top-nav-content pt-3">
        <HomeBannerSearchFilterationCompo2 showOnDesktop hideSearchBarMargin hideWrapperPadding hideSuggestions />
      </div>

      <main className="container py-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 text-center text-md-start">
          <div className="w-100">
            <h1 className="h3 mb-2">
              Results for <span className="text-primary">"{keyword || 'All'}"</span>
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: 15 }}>
              Searching under <strong>{resolvedCategory || routeCategory}</strong>
              {matchedSubcategory && matchedSubcategory !== 'all'
                ? ` · subcategory "${matchedSubcategory}"`
                : ''}
              {matchedSubsubcategory && matchedSubsubcategory !== 'all'
                ? ` · style "${matchedSubsubcategory}"`
                : ''}
            </p>
          </div>
        </div>

        {searchQuery.isLoading ? (
          <div className="mb-4">
            <Skeleton variant="rectangular" width="100%" height={130} className="mb-3" />
            <div className="d-flex gap-3">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" width="100%" height={220} />
              ))}
            </div>
          </div>
        ) : searchQuery.isError ? (
          <QueryErrorRetry
            message={searchQuery.error?.response?.data?.message || searchQuery.error?.message || 'Failed to load search results'}
            onRetry={() => searchQuery.refetch()}
          />
        ) : results.length === 0 ? (
          <>
            <section
              className="text-center mx-auto my-5"
              style={{
                maxWidth: 760,
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '42px 24px',
                background: '#ffffff',
                boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
              }}
            >
              <h2 className="h4 fw-bold mb-2">No assets found for "{keyword}"</h2>
              <p className="text-muted mb-4">
                We could not find a clear match in {resolvedCategory || routeCategory}. Try a broader keyword or explore related HDPiks collections.
              </p>
              <div className="d-flex justify-content-center flex-wrap gap-2">
                {emptySuggestions.map((item) => (
                  <Link key={`${item.label}-${item.to}`} to={item.to} className="btn btn-outline-dark btn-sm">
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>

            {exploreAssets.length > 0 && (
              <section className="mt-4">
                <div className="mb-3">
                  <h2 className="h4 fw-bold mb-1">Explore popular {resolvedCategory || routeCategory}</h2>
                  <p className="text-muted mb-0">Handy alternatives while we grow this search result.</p>
                </div>
                <FilterationImages
                  name={resolvedCategory}
                  presetSubcategory="all"
                  presetSubSubcategory="all"
                  searchSubcategory=""
                  providedImages={exploreAssets}
                  providedTotal={exploreAssets.length}
                />
              </section>
            )}
          </>
        ) : (
          <FilterationImages
            name={resolvedCategory}
            presetSubcategory="all"
            presetSubSubcategory="all"
            searchSubcategory=""
            providedImages={results}
          />
        )}
      </main>

      <AppFooter />
    </>
  );
}

export default SearchPage;
