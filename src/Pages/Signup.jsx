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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const hasUsernameError = !!username && username.trim().length < 3;
  const hasEmailError = !!semail && !emailRegex.test(semail.trim());
  const hasPasswordError = !!password && !strongPasswordRegex.test(password);
  const hasConfirmPasswordError = !!confirmPassword && password !== confirmPassword;

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
                      className={`form-control ${hasUsernameError ? 'is-invalid' : ''}`}
                      id="username"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="username">Username</label>
                    {hasUsernameError && (
                      <div className="invalid-feedback">Username must be at least 3 characters.</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <p className='fw-semibold'>E-Mail Address</p>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className={`form-control ${hasEmailError ? 'is-invalid' : ''}`}
                      id="email"
                      placeholder="name@example.com"
                      value={semail}
                      onChange={(e) => setsEmail(e.target.value)}
                    />
                    <label htmlFor="email">Email address</label>
                    {hasEmailError && (
                      <div className="invalid-feedback">Please enter a valid email address.</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <p className='fw-semibold'>Password</p>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className={`form-control ${hasPasswordError ? 'is-invalid' : ''}`}
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="password">Password</label>
                    {hasPasswordError && (
                      <div className="invalid-feedback">
                        Password must be 8+ chars and include uppercase, lowercase, number, and special character.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <p className='fw-semibold'>Confirm Password</p>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className={`form-control ${hasConfirmPasswordError ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    {hasConfirmPasswordError && (
                      <div className="invalid-feedback">Passwords do not match.</div>
                    )}
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
