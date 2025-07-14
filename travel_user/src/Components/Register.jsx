import React from 'react'
import logo from "../assets/GlobeWay.png"
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

const Register = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    password: "",
    conpassword: ""
  });

  const [errors, setErrors] = useState({
    name: "",
    password: "",
    conpassword: ""
  });

  const navigate = useNavigate();

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

    if (formData.name.length < 3 && formData.name.length > 0) {
      newErrors.name = "Name must be at least 3 characters";
      valid = false;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters with at least one special character";
      valid = false;
    }

    if (formData.password !== formData.conpassword) {
      newErrors.conpassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return; // Don't submit if validation fails
    }

    try {
      // Remove conpassword before sending to server
      const { conpassword, ...dataToSend } = formData;

      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend) // Send formData without conpassword
      });

      const data = await response.json();

      if (data.status) {
        setRegistrationSuccess(true);
        setTimeout(() => navigate('/login'), 5000); // Use navigate instead of window.location
      }

      else {
        // Handle server-side errors
        console.error('Registration failed:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="left-section">
          <h1>Welcome!</h1>
          <p>Join our community today</p>
        </div>
        <div className="right-section">
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <div>
                <img src={logo} alt="logo" className="logo" />
                <h2>Register</h2>
              </div>
             
            </div>
 <div className="divider"></div>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter Exact location"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

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
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter Password (min 8 chars with special character)"
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

            <div className="form-group">
              <label htmlFor="conpassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="conpassword"
                  name="conpassword"
                  placeholder="Confirm Your Password"
                  value={formData.conpassword}
                  onChange={handleChange}
                  required
                />
                <div className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
                </div>
              </div>
              {errors.conpassword && <span className="error-message">{errors.conpassword}</span>}
            </div>


            <button type="submit" className="submit-btn">
              Register
            </button>
            <div>
              <p>Already Have Account? <Link to="/login">Login</Link></p>
            </div>

            {registrationSuccess && (
              <div className="success-message">
                Registration is successful! Redirecting to home in 5 seconds...
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default Register;                                                                                                                             
=======
export default Register;
>>>>>>> a2e8ae1585e266b809e0ac966d0beede84b10f83
