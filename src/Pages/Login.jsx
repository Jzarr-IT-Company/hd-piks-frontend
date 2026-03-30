import React, { useMemo, useState } from 'react';
import img from '../assets/loginpic.webp';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Services/api.js';
import { API_ENDPOINTS } from '../config/api.config.js';
import { message, Spin } from 'antd';
import Cookies from 'js-cookie';
import { Home } from 'lucide-react';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const resetPasswordInvalid = useMemo(
    () => !!resetPassword && !strongPasswordRegex.test(resetPassword),
    [resetPassword]
  );
  const resetConfirmInvalid = useMemo(
    () => !!resetConfirmPassword && resetPassword !== resetConfirmPassword,
    [resetConfirmPassword, resetPassword]
  );

  const resetForgotForm = () => {
    setForgotMode(false);
    setForgotStep(1);
    setResetEmail('');
    setResetUsername('');
    setResetPassword('');
    setResetConfirmPassword('');
    setResetToken('');
    setResetLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      if (response.data.status === 200) {
        message.success('login successfull');
        Cookies.set('id', response.data.id);
        Cookies.set('token', response.data.accessToken || response.data.token);
        setEmail('');
        setPassword('');
        navigate('/');
        window.location.reload();
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 401) {
        message.error('Invalid Credentials');
      } else {
        console.log(error?.message || error);
        message.error(error?.response?.data?.message || 'some thing went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetUsername.trim()) {
      message.error('Please enter both email and username');
      return;
    }
    setResetLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.PASSWORD_RESET_CHECK_IDENTITY, {
        email: resetEmail,
        name: resetUsername,
      });
      setResetToken(response?.data?.resetToken || '');
      setForgotStep(2);
      message.success('Identity verified. Set your new password.');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Unable to verify your account');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken) {
      message.error('Reset session expired. Please verify again.');
      setForgotStep(1);
      return;
    }
    if (!resetPassword || !resetConfirmPassword) {
      message.error('Please enter new password and confirm password');
      return;
    }
    if (!strongPasswordRegex.test(resetPassword)) {
      message.error('Password must be 8+ chars and include uppercase, lowercase, number and special character');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      message.error('Password and confirm password do not match');
      return;
    }
    setResetLoading(true);
    try {
      await api.post(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, {
        resetToken,
        password: resetPassword,
        confirmPassword: resetConfirmPassword,
      });
      message.success('Password updated successfully. Please login.');
      setEmail(resetEmail);
      resetForgotForm();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Unable to update password');
    } finally {
      setResetLoading(false);
    }
  };

  const homeLinkStyle = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    color: '#4c1d95',
    textDecoration: 'none',
  };

  return (
    <section className='py-5' style={{ background: 'linear-gradient(135deg, rgba(208, 194, 224, 0.7), rgba(255, 236, 235, 0.7), rgba(212, 239, 223, 0.7))', height: '130vh' }}>
      <div className="container">
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-lg-6 col-md-6 col-sm-12 d-none d-md-block">
            <img src={img} className="img-fluid" alt="" />
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 bg-white py-5 px-4 rounded-3" style={{ position: 'relative' }}>
            <Link to="/" style={homeLinkStyle} aria-label="Go to homepage">
              <Home size={18} />
            </Link>
            <h4 className='mb-4'>{forgotMode ? 'Forgot Password' : 'Login'}</h4>

            {!forgotMode ? (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-12 col-sm-12">
                    <p className='fw-semibold'>E-Mail Address</p>
                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); }}
                      />
                      <label htmlFor="email">Email address</label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12 col-sm-12">
                    <p className='fw-semibold'>Password</p>
                    <div className="form-floating mb-2">
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); }}
                      />
                      <label htmlFor="password">Password</label>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end mb-3">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => setForgotMode(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div>
                  <button className="btn w-100 py-2 text-white fw-semibold" style={{ backgroundColor: '#58207e' }} type="submit">
                    {loading ? <Spin /> : 'LOGIN'}
                  </button>
                </div>
              </form>
            ) : forgotStep === 1 ? (
              <form onSubmit={handleVerifyIdentity}>
                <p className="text-muted mb-3">Enter your registered email and username to verify your account.</p>
                <div className="row">
                  <div className="col-md-12 col-sm-12">
                    <p className='fw-semibold'>E-Mail Address</p>
                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control"
                        id="resetEmail"
                        placeholder="name@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                      <label htmlFor="resetEmail">Email address</label>
                    </div>
                  </div>
                  <div className="col-md-12 col-sm-12">
                    <p className='fw-semibold'>Username</p>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="resetUsername"
                        placeholder="Username"
                        value={resetUsername}
                        onChange={(e) => setResetUsername(e.target.value)}
                      />
                      <label htmlFor="resetUsername">Username</label>
                    </div>
                  </div>
                </div>
                <div className="d-grid gap-2">
                  <button className="btn py-2 text-white fw-semibold" style={{ backgroundColor: '#58207e' }} type="submit">
                    {resetLoading ? <Spin /> : 'VERIFY ACCOUNT'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForgotForm}>
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <p className="text-muted mb-3">Identity verified for <strong>{resetEmail}</strong>. Set your new password below.</p>
                <div className="row">
                  <div className="col-md-12 col-sm-12">
                    <p className='fw-semibold'>New Password</p>
                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className={`form-control ${resetPasswordInvalid ? 'is-invalid' : ''}`}
                        id="resetPassword"
                        placeholder="New Password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                      />
                      <label htmlFor="resetPassword">New Password</label>
                      {resetPasswordInvalid && (
                        <div className="invalid-feedback">
                          Password must be 8+ chars and include uppercase, lowercase, number, and special character.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-12 col-sm-12">
                    <p className='fw-semibold'>Confirm Password</p>
                    <div className="form-floating mb-3">
                      <input
                        type="password"
                        className={`form-control ${resetConfirmInvalid ? 'is-invalid' : ''}`}
                        id="resetConfirmPassword"
                        placeholder="Confirm Password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                      />
                      <label htmlFor="resetConfirmPassword">Confirm Password</label>
                      {resetConfirmInvalid && (
                        <div className="invalid-feedback">Passwords do not match.</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="d-grid gap-2">
                  <button className="btn py-2 text-white fw-semibold" style={{ backgroundColor: '#58207e' }} type="submit">
                    {resetLoading ? <Spin /> : 'UPDATE PASSWORD'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setForgotStep(1);
                      setResetPassword('');
                      setResetConfirmPassword('');
                      setResetToken('');
                    }}
                  >
                    Reverify Account
                  </button>
                </div>
              </form>
            )}

            {!forgotMode && (
              <div className="mt-3 d-flex justify-content-center align-items-center">
                <p>Don&apos;t have an account? <Link to={'/signup'} className='text-dark fw-semibold btn text-decoration-none' style={{ backgroundColor: '#ffeb3b' }}>Create Account</Link></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
