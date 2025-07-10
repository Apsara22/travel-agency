import React from 'react'
import logo from "../assets/GlobeWay.png"
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from "react";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

const Login = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Effect to hide messages after 0.5 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { ...errors };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with at least one special character";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.status) {
        setLoginSuccess(true);
        setShowMessage(true);
        setTimeout(() => navigate('/navbar'), 500);
      } else {
        setLoginError(data.message || "Login failed");
        setShowMessage(true);
      }
    } catch (error) {
      setLoginError("An error occurred during login");
      setShowMessage(true);
      console.error('Error:', error);
    }
  };

  return (
    <div className="login-container">
      {/* Message Popup */}
      {showMessage && (
        <div className={`message-popup ${loginSuccess ? "success" : "error"}`}>
          {loginSuccess ? "Login successful!" : loginError}
        </div>
      )}

      <div className="login-box">
        <div className="form-header">
          <img src={logo} alt="logo" className="logo" />
          <h1>Login</h1>
        </div>
        <div className="divider"></div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
              </div>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
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

export default Login;
