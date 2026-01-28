import React from 'react';
import logo from '../../assets/logo1.webp';
import { Link } from 'react-router-dom';
import './Footer.css'

function AppFooter() {
  return (
    <>
      <div className="container-fluid px-0">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <footer
            className="text-center text-lg-start text-white pt-5"
            style={{
              backgroundColor: "#221122",
              position: "relative",
              color: "white",
            }}
          >
            <div
              className="overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              }}
            />
            <div className="container p-4 pb-0" style={{ position: "relative", zIndex: 1 }}>
              <section>
                <div className="row">
                  <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                    <h5 className="text-uppercase">GadgetHub Gallery</h5>
                    <p>
                      Your go-to platform for high-quality images and videos, ready for use
                      in your projects. Enjoy a diverse range of authentic visuals at your fingertips.
                    </p>
                  </div>
                  <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
                    <h5 className="text-uppercase">Explore</h5>
                    <ul className="list-unstyled mb-0">
                      <li>
                        <Link to="/" className="text-white">
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link to="/about" className="text-white">
                          About Us
                        </Link>
                      </li>
                      <li>
                        <Link to="/contact" className="text-white">
                          Contact Us
                        </Link>
                      </li>
                      <li>
                        <Link to="/faq" className="text-white">
                          FAQ'S
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
                    <h5 className="text-uppercase">Legal</h5>
                    <ul className="list-unstyled mb-0">
                      <li>
                        <Link to="/terms" className="text-white">
                          Terms & Conditions
                        </Link>
                      </li>
                      <li>
                        <Link to="/privacy" className="text-white">
                          Privacy Policy
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
                    <h5 className="text-uppercase">Follow Us</h5>
                    <section className="mb-4 text-center">
                      <a
                        className="btn btn-outline-light btn-floating m-1"
                        href="#"
                        role="button"
                        style={{ backgroundColor: "#4267B2", color: "#fff" }}
                      >
                        <i className="fab fa-facebook-f" />
                      </a>
                      <a
                        className="btn btn-outline-light btn-floating m-1"
                        href="#"
                        role="button"
                        style={{ backgroundColor: "#1DA1F2", color: "#fff" }}
                      >
                        <i className="fab fa-twitter" />
                      </a>
                      <a
                        className="btn btn-outline-light btn-floating m-1"
                        href="#"
                        role="button"
                        style={{ backgroundColor: "#DB4437", color: "#fff" }}
                      >
                        <i className="fab fa-google" />
                      </a>
                      <a
                        className="btn btn-outline-light btn-floating m-1"
                        href="#"
                        role="button"
                        style={{ backgroundColor: "#E1306C", color: "#fff" }}
                      >
                        <i className="fab fa-instagram" />
                      </a>
                      <a
                        className="btn btn-outline-light btn-floating m-1"
                        href="#"
                        role="button"
                        style={{ backgroundColor: "#0077B5", color: "#fff" }}
                      >
                        <i className="fab fa-linkedin-in" />
                      </a>
                    </section>
                  </div>
                </div>
              </section>
              <hr className="mb-4" />
              <section className="mb-4">
                <p className="d-flex justify-content-center align-items-center">
                  <span className="me-3">Join us for exclusive content</span>
                  <button type="button" className="btn btn-outline-light btn-rounded">
                    Sign up!
                  </button>
                </p>
              </section>
              <hr className="mb-4" />
            </div>
            <div
              className="text-center p-3"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
            >
              © 2018-2024 HDpicks - Powered by <Link className='text-decoration-underline' to={'/'}>JZARR IT COMPANY</Link>
            </div>
          </footer>
        </Link>
      </div>
    </>
  );
}

export default AppFooter;
