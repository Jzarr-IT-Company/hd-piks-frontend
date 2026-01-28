import React, { useState } from 'react';
import img from '../assets/loginpic.webp';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Services/api.js';
import { API_ENDPOINTS } from '../config/api.config.js';
import { message, Spin } from 'antd';
import Cookies from 'js-cookie';


function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email: email, password: password
      });
      if (response.data.status == 200) {
        setLoading(false)
        message.success("login successfull")
        navigate('/')
        Cookies.set("id", response.data.id)
        Cookies.set("token", response.data.token)
        console.log("RESPONSE", response.data.token)
        console.log("RESPONSE", response.data.id)
        window.location.reload()
        setEmail('');
        setPassword('')
      }
    } catch (error) {
      setLoading(false)
      if (error.status == 404) {
        message.error("Invalid Credentials")
      } else {
        setLoading(false)
        console.log(error.message)
        message.error("some thing went wrong")
      }
    } finally {
      setLoading(false)
    }
  };

  return (
    <section className='py-5' style={{ background: "linear-gradient(135deg, rgba(208, 194, 224, 0.7), rgba(255, 236, 235, 0.7), rgba(212, 239, 223, 0.7))", height: "130vh" }}>
      <div className="container">
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-lg-6 col-md-6 col-sm-12 d-none d-md-block">
            <img src={img} className="img-fluid" alt="" />
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 bg-white py-5 px-4 rounded-3">
            <h4 className='mb-5'>Login</h4>
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
                      onChange={(e) => { setEmail(e.target.value) }}
                    />
                    <label htmlFor="email">Email address</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-sm-12">
                  <p className='fw-semibold'>Password</p>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value) }}
                    />
                    <label htmlFor="password">Password</label>
                  </div>
                </div>
              </div>
              <div>
                <button className="btn w-100 py-2 text-white fw-semibold" style={{ backgroundColor: "#58207e" }} type="submit">
                  {loading ? <Spin /> : "LOGIN"}
                </button>
              </div>
            </form>
            <div className="mt-3 d-flex justify-content-center align-items-center">
            <p>Don&apos;t have an account? <Link to={'/signup'} className='text-dark fw-semibold btn text-decoration-none' style={{ backgroundColor: "#ffeb3b" }}>Create Account</Link></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
