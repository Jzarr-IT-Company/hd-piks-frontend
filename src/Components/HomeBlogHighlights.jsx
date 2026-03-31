import React, { useRef } from 'react';
import './HomeBlogHighlights.css';
import blogImgOne from '../assets/02_Images_4K.jpeg';
import blogImgTwo from '../assets/01_Videos_4K.jpeg';
import blogImgThree from '../assets/08_Mockups_4K.jpeg';

const BLOGS = [
  {
    tag: 'Wallpapers',
    title: 'Teal Colour Wallpapers',
    description: 'Explore teal wallpaper ideas, moods, and fresh background inspiration.',
    href: 'https://www.hdpiks.com/blog/teal-colour-wallpapers/',
    image: blogImgOne,
  },
  {
    tag: 'Wallpapers',
    title: 'Western Wallpaper',
    description: 'A visual roundup of western wallpaper styles, tones, and creative use cases.',
    href: 'https://www.hdpiks.com/blog/western-wallpaper/',
    image: blogImgTwo,
  },
  {
    tag: 'Nature',
    title: 'Tree Wallpaper HD Images',
    description: 'Discover tree-themed HD wallpaper ideas for mobile, desktop, and branding.',
    href: 'https://www.hdpiks.com/blog/tree-wallpaper-hd-images/',
    image: blogImgThree,
  },
];

export default function HomeBlogHighlights() {
  const trackRef = useRef(null);
  const leftArrow = '\u2190';
  const rightArrow = '\u2192';

  const scrollTrack = (direction) => {
    if (!trackRef.current) return;
    const offset = direction === 'left' ? -360 : 360;
    trackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="home-blog py-4 py-md-5">
      <div className="container">
        <div className="home-blog__card">
          <div className="home-blog__header">
            <div className="home-blog__header-text">
              <span className="home-blog__kicker">Featured Reads</span>
              <h2 className="home-blog__title">Explore Blog Highlights</h2>
              <p className="home-blog__desc">
                Browse three featured blog destinations and move through them manually with the carousel arrows.
              </p>
            </div>
            <div className="home-blog__nav">
              <button type="button" className="home-blog__nav-btn" onClick={() => scrollTrack('left')} aria-label="Scroll left">
                {leftArrow}
              </button>
              <button type="button" className="home-blog__nav-btn" onClick={() => scrollTrack('right')} aria-label="Scroll right">
                {rightArrow}
              </button>
            </div>
          </div>

          <div className="home-blog__track" ref={trackRef}>
            {BLOGS.map((blog) => (
              <article key={blog.title} className="home-blog__item">
                <div className="home-blog__image-wrap">
                  <img src={blog.image} alt={blog.title} className="home-blog__image" />
                </div>
                <div className="home-blog__body">
                  <span className="home-blog__pill">{blog.tag.toUpperCase()}</span>
                  <h3 className="home-blog__item-title">{blog.title}</h3>
                  <p className="home-blog__item-desc">{blog.description}</p>
                  <a className="home-blog__link" href={blog.href} target="_blank" rel="noreferrer">
                    Read more {rightArrow}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

