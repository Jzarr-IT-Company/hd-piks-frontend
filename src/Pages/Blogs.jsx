import React from 'react'
import BlogsBanner1 from '../Components/BlogsBanner1/BlogsBanner1'
import BlogsNavbar from '../Components/BlogsNavbar/BlogsNavbar'
import BlogsBanner2 from '../Components/BlogsBanner2/BlogsBanner2'
import AppFooter from '../Components/AppFooter/AppFooter'

function Blogs() {
  return (
    <>
      <BlogsNavbar />
      <BlogsBanner1 />
      <BlogsBanner2 />
      <AppFooter />
    </>
  )
}

export default Blogs