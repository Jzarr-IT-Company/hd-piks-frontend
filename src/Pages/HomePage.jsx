import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AppNavbar from '../Components/AppNavbar/AppNavbar';
// Big collage: "Explore Our Collections" (Characters, Wallpaper, etc.)
import HomeBanner1 from '../Components/HomeBanner1/HomeBanner1';
// HomeBanner2 currently unused (type cards moved into AppNavbarBanner1Compo)
import HomeBanner2 from '../Components/HomeBanner2/HomeBanner2';
// import CollectionBanner1 from '../Components/CollectionBanner1/CollectionBanner1';
import HomeBanner4 from '../Components/HomeBanner4/HomeBanner4';
import Testmonials from '../Components/Testmonials/Testmonials';
import AppFooter from '../Components/AppFooter/AppFooter';
import HomeBanner5 from '../Components/HomeBanner5/HomeBanner5';
import HomeBanner6 from '../Components/HomeBanner6/HomeBanner6';
import HomeFaqBeforeDownload from '../Components/HomeFaqBeforeDownload';
import HomeBlogHighlights from '../Components/HomeBlogHighlights';
// import HomeBanner7 from '../Components/HomeBanner7/HomeBanner7';
import Homebanner1Compo from '../Components/HomeBanner1Compo/HomeBanner1Compo';
import HomeGallery from '../Components/HomeGallery/HomeGallery';
import AppNavbarBanner1Compo from '../Components/AppNavbarBanner1Compo/AppNavbarBanner1Compo';
import SeoHead from '../Components/SeoHead/SeoHead.jsx';
import { usePublicCategoriesQuery } from '../query/categoryQueries.js';
function HomePage() {
  const { galleryCategory } = useParams();
  const categoriesQuery = usePublicCategoriesQuery();

  const currentGalleryCategory = useMemo(() => {
    if (!galleryCategory || !Array.isArray(categoriesQuery.data)) return null;
    const normalized = String(galleryCategory || '').trim().toLowerCase();
    return categoriesQuery.data.find(
      (item) => String(item?.name || '').trim().toLowerCase() === normalized
    ) || null;
  }, [categoriesQuery.data, galleryCategory]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      {currentGalleryCategory ? (
        <SeoHead
          title={`${currentGalleryCategory.name} | Elvify`}
          description={currentGalleryCategory.description || `Browse ${currentGalleryCategory.name} assets on Elvify.`}
          canonicalUrl={typeof window !== 'undefined' ? window.location.href : ''}
          metaTagsHtml={currentGalleryCategory?.seo?.metaTagsHtml || ''}
          schemaScriptHtml={currentGalleryCategory?.seo?.schemaScriptHtml || ''}
        />
      ) : null}
      {/* navbar top  with search bar */}
      <AppNavbar />
      {/* categories banner cards with carousel (Videos / Images / AI images / Templates / etc.) */}
      <AppNavbarBanner1Compo/>

      {/* Collections collage section by sub catgories */}
      <HomeBanner1 />

      {/* Additional home banner (HomeBanner1Compo) */}
      {/* <Homebanner1Compo /> */}

      {/* homegallery section (new) */} 
      <HomeGallery />

   {/* ------------------------------------- */}
      {/* <CollectionBanner1 /> */}
      <HomeBanner5/>
      <HomeFaqBeforeDownload />
      <HomeBanner6/>
      <HomeBanner4 />
      {/* <HomeBanner7 />  this was deprecated  */}

      {/* ------------------------------- */}

      <HomeBlogHighlights />
      <Testmonials />
      <AppFooter />
    </>
  );
}

export default HomePage;
