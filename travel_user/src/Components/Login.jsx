import React from 'react'
import logo from "../assets/GlobeWay.png"
import { Link } from 'react-router-dom'


const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="form-header">
          <img src={logo} alt="logo" className="logo" />
          <h1>Login</h1>
        </div>
        <div className="divider"></div>
        <form className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter Password"
            />
          </div>
          <button type="submit" className="submit-btn">
            Submit
          </button>
           <div>
              <p>Don't Have Account? <Link to="/register">Register</Link></p>
            </div>
        </form>
      </div>
    </div>
  )
}

export default Login