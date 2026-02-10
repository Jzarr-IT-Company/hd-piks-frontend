import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './HomeBanner5.css';
import googleLogo from '../../assets/Google-logo.png';
import nubankLogo from '../../assets/nubanklogo.png';
import hellofreshLogo from '../../assets/HelloFresh-Logo.png';
import cocacolaLogo from '../../assets/Cocalogo.png';
import ogilvyLogo from '../../assets/Ogilvylogo.png';
import dribbbleLogo from '../../assets/Dribbble_logo.png';
// Partner logos to show in the marquee
const LOGOS = [
  { id: 'google', src: googleLogo, alt: 'Google' },
  { id: 'nubank', src: nubankLogo, alt: 'Nubank' },
  { id: 'hellofresh', src: hellofreshLogo, alt: 'HelloFresh' },
  { id: 'cocacola', src: cocacolaLogo, alt: 'Coca‑Cola' },
  { id: 'ogilvy', src: ogilvyLogo, alt: 'Ogilvy' },
  { id: 'dribbble', src: dribbbleLogo, alt: 'Dribbble' },
];

function HomeBanner5() {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const id = Cookies.get('id');
    const token = Cookies.get('token');
    const handle = () => {
        if (!id && !token) {
            return  navigate('/login')
        }
        navigate('/dashboard')
        window.scroll(0, 0)
    }
    return (
        <section className="home-banner-5 py-5 mb-5">
            <div className="container">
                {/* KEEP THIS HEADER + CTA */}
                <h3 className='text-center mb-4 display-5 fw-bold'>Unlock Your Creativity</h3>
                <p className='text-center mb-5'>
                    Every stock image tells a story crafted by a talented creator. Join Freepik&apos;s vibrant community <br />
                    of creators and start monetizing your unique content today!
                </p>
                <div className="d-flex justify-content-center align-items-center mb-5">
                    <button className='button' onClick={handle}>Sell Content</button>
                </div>

                {/* Logos carousel (replaces long hard-coded <img> list) */}
                <div
                    className="row scroll-container"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className={`col-12 scroll-images ${isHovered ? 'paused' : ''}`}>
                        {[...LOGOS, ...LOGOS].map((logo, idx) => (
                            <div key={`${logo.id}-${idx}`} className="partner-logo-wrapper">
                                <img
                                    src={logo.src}
                                    alt={logo.alt}
                                    className="img-fluid partner-logo-img"
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeBanner5;

