import React from 'react';
import img from '../assets/loginpic.webp';
import { Link } from 'react-router-dom';
import SocialAuthentication from '../Components/SocialAuthentication/SocialAuthentication';
import RegisteredBttn from '../Components/RegisteredBttn/RegisteredBttn';
import { useGlobalState } from '../Context/Context';

function Signup() {
  const { username, setUsername,
    semail, setsEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword, } = useGlobalState()
  return (
    <section className='py-5' style={{ background: "linear-gradient(135deg, rgba(208, 194, 224, 0.7), rgba(255, 236, 235, 0.7), rgba(212, 239, 223, 0.7))" }}>
      <div className="container">
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <img src={img} className="img-fluid d-md-block d-none" alt="" />
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 bg-white py-5 px-3 rounded-3">
            <h4 className='mb-5'>Register Now</h4>
            <div>
              <div className="row">
                <div className="col-md-6">
                  <p className='fw-semibold'>Username</p>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="username">Username</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <p className='fw-semibold'>E-Mail Address</p>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="name@example.com"
                      value={semail}
                      onChange={(e) => setsEmail(e.target.value)}
                    />
                    <label htmlFor="email">Email address</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <p className='fw-semibold'>Password</p>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="password">Password</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <p className='fw-semibold'>Confirm Password</p>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                  </div>
                </div>
              </div>
              <div>
                <RegisteredBttn />
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-center align-items-center">
              <p>Already have an account? <Link className='text-dark fw-semibold btn text-decoration-none' to={'/login'} style={{ backgroundColor: "#ffeb3b" }}>Login Now</Link></p>
            </div>
            <p className='text-center fs-5'>or</p>
            <SocialAuthentication />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;
