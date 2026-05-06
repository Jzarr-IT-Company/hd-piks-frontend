import React from 'react';
import { useNavigate } from 'react-router-dom';
import featureImg from '../../assets/hdpikscanva.png';
import './HomeBanner6.css';

function HomeBanner6() {
  const navigate = useNavigate();

  return (
    <section className="home-banner-6 py-4 py-md-5">
      <div className="container">
        <div className="home-banner-6__card">
          <div className="row g-0 align-items-stretch">
            <div className="col-12 col-lg-6">
              <div className="home-banner-6__content">
                <span className="home-banner-6__kicker">Design Better, Faster</span>
                <h3 className="home-banner-6__title">Create Scroll-Stopping Visuals With Elvify</h3>
                <p className="home-banner-6__desc">
                  Discover curated assets, quick edit tools, and creative-ready downloads in one place.
                  Build your next campaign with consistent quality and speed.
                </p>
                <div className="home-banner-6__actions">
                  <button className="home-banner-6__btn home-banner-6__btn--primary" onClick={() => navigate('/collection/image')}>
                    Explore Images
                  </button>
                  <button className="home-banner-6__btn home-banner-6__btn--ghost" onClick={() => navigate('/design-elvify')}>
                    Open Studio
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="home-banner-6__media-wrap">
                <div className="home-banner-6__media-frame">
                  <img src={featureImg} alt="HDPiks creative preview" className="home-banner-6__media" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeBanner6;
