import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { registerUser } from '../services/api';
import { saveSession } from '../services/auth';

const Signup = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const validateField = (name, value, currentData) => {
    if (!value.trim()) return 'This field is required.';
    if (name === 'email' && !emailRegex.test(value)) return 'Please enter a valid email address.';
    if (name === 'password' && value.length < 6) return 'Password must be at least 6 characters.';
    if (name === 'confirmPassword' && value !== currentData.password) return 'Passwords do not match.';
    return '';
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateField('name', formData.name, formData),
      email: validateField('email', formData.email, formData),
      phone: validateField('phone', formData.phone, formData),
      password: validateField('password', formData.password, formData),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData)
    };
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextData = {
      ...formData,
      [name]: value
    };
    setFormData(nextData);
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, nextData),
      ...(name === 'password'
        ? { confirmPassword: validateField('confirmPassword', nextData.confirmPassword, nextData) }
        : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setApiError('');
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      };
      const response = await registerUser(payload);
      const token = response?.token || response?.accessToken || response?.data?.token;
      const userPayload = response?.user || response?.data || { name: payload.name, email: payload.email };
      saveSession({
        token: token || `user-token-${Date.now()}`,
        role: 'user',
        user: userPayload
      });
      navigate('/user-dashboard');
    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us to enhance your property value</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {apiError && <p>{apiError}</p>}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
              {errors.name && <p>{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              {errors.email && <p>{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
              {errors.phone && <p>{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
              {errors.password && <p>{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              Sign Up
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <span className="auth-link" onClick={() => navigate('/login')}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;