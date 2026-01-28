import React from 'react';
import AppNavbar from '../Components/AppNavbar/AppNavbar';
import HomeBanner1 from '../Components/HomeBanner1/HomeBanner1';
import HomeBanner2 from '../Components/HomeBanner2/HomeBanner2';
import CollectionBanner1 from '../Components/CollectionBanner1/CollectionBanner1';
import HomeBanner4 from '../Components/HomeBanner4/HomeBanner4';
import Testmonials from '../Components/Testmonials/Testmonials';
import AppFooter from '../Components/AppFooter/AppFooter';
import HomeBanner5 from '../Components/HomeBanner5/HomeBanner5';
import HomeBanner7 from '../Components/HomeBanner7/HomeBanner7';
import Homebanner1Compo from '../Components/HomeBanner1Compo/HomeBanner1Compo'
import HomeGallery from '../Components/HomeGallery/HomeGallery';

function HomePage() {
  return (
    <>
      <AppNavbar />
      <HomeBanner2 />
      <HomeBanner1 />
      <Homebanner1Compo />
      <HomeGallery />
      <CollectionBanner1 />
      <HomeBanner5 />
      <HomeBanner4 />
      <HomeBanner7 />
      <Testmonials />
      <AppFooter />
    </>
  );
}

export default HomePage;
