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
    console.log('Form submitted');
    
    if (!validateForm()) {
      console.log('Form validation failed', errors);
      alert('Please fill all required fields correctly');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captcha) {
      console.log('Captcha mismatch');
      setErrors((prev) => ({ ...prev, captchaInput: 'Incorrect captcha. Please try again.' }));
      return;
    }

    setApiError('');
    setIsLoading(true);
    try {
      console.log('Calling loginUser API...');
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('Login Response:', response);
      
      // Get role from response - backend returns "USER" or "ADMIN" in uppercase
      const role = response?.role || response?.data?.role || 'user';
      
      // Get token from response
      const token = response?.token || response?.accessToken || response?.data?.token;
      
      // Get user data from response
      const userPayload = response?.user || response?.data?.user || { 
        id: response?.userId,
        name: response?.name, 
        email: formData.email.trim() 
      };
      
      if (!token) {
        throw new Error('No authentication token received from server');
      }
      
      // Save session with role (will be converted to lowercase in auth.js)
      saveSession({
        token: token,
        role: role,
        user: userPayload
      });
      
      // Navigate based on role
      const normalizedRole = typeof role === 'string' ? role.toLowerCase() : 'user';
      console.log('Normalized role:', normalizedRole);
      
      if (normalizedRole === 'admin') {
        console.log('Navigating to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('Navigating to user dashboard');
        navigate('/user-dashboard');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.message || 'Login failed. Please check your credentials and try again.';
      setApiError(errorMsg);
      alert(errorMsg); // Show alert so user definitely sees it
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
            {apiError && <div className="error-message">{apiError}</div>}
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
              {errors.email && <div className="error-text">{errors.email}</div>}
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
              {errors.password && <div className="error-text">{errors.password}</div>}
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
                  style={{ cursor: 'pointer', fontSize: '20px' }}
                >
                  ↻
                </span>
              </label>
              <input
                type="text"
                id="captchaDisplay"
                name="captchaDisplay"
                value={captcha}
                readOnly
                style={{ backgroundColor: '#f0f0f0', marginBottom: '10px' }}
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
              {errors.captchaInput && <div className="error-text">{errors.captchaInput}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
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