import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { loginUser } from '../services/api';
import { saveSession } from '../services/auth';

const Login = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = Math.floor(Math.random() * 3) + 6;
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setErrors((prev) => ({ ...prev, captchaInput: '' }));
  };

  const validateField = (name, value) => {
    if (!value.trim()) return 'This field is required.';
    if (name === 'email' && !emailRegex.test(value)) return 'Please enter a valid email address.';
    if (name === 'password' && value.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const validateForm = () => {
    const nextErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      captchaInput: validateField('captchaInput', captchaInput)
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (captchaInput.trim().toUpperCase() !== captcha) {
      setErrors((prev) => ({ ...prev, captchaInput: 'Incorrect captcha. Please try again.' }));
      return;
    }

    setApiError('');
    setIsLoading(true);
    try {
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });
      const token = response?.token || response?.accessToken || response?.data?.token;
      const userPayload = response?.user || response?.data || { email: formData.email.trim() };
      saveSession({
        token: token || `user-token-${Date.now()}`,
        role: 'user',
        user: userPayload
      });
      navigate('/user-dashboard');
    } catch (error) {
      setApiError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">User Login</h2>
          <p className="auth-subtitle">Welcome back! Please login to your account.</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {apiError && <p>{apiError}</p>}
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
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              {errors.password && <p>{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="captchaInput">
                Captcha: {captcha}{' '}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={refreshCaptcha}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      refreshCaptcha();
                    }
                  }}
                  aria-label="Refresh captcha"
                >
                  ↻
                </span>
              </label>
              <input
                type="text"
                id="captcha"
                name="captchaDisplay"
                value={captcha}
                readOnly
              />
              <input
                type="text"
                id="captchaInput"
                name="captchaInput"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    captchaInput: validateField('captchaInput', e.target.value)
                  }));
                }}
                placeholder="Enter captcha"
                required
              />
              {errors.captchaInput && <p>{errors.captchaInput}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              Login
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <span className="auth-link" onClick={() => navigate('/signup')}>
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;