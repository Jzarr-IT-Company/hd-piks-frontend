import React from 'react';
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
// import HomeBanner7 from '../Components/HomeBanner7/HomeBanner7';
import Homebanner1Compo from '../Components/HomeBanner1Compo/HomeBanner1Compo';
import HomeGallery from '../Components/HomeGallery/HomeGallery';
import AppNavbarBanner1Compo from '../Components/AppNavbarBanner1Compo/AppNavbarBanner1Compo';
function HomePage() {
  return (
    <>
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
      <HomeBanner4 />
      {/* <HomeBanner7 />  this was deprecated  */}

      {/* ------------------------------- */}

      <Testmonials />
      <AppFooter />
    </>
  );
}

export default HomePage;
