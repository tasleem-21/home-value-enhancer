import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { saveSession } from '../services/auth';
import { loginUser } from '../services/api';

const AdminLogin = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const collectRoleValues = (response) => {
    const directRoles = [
      response?.role,
      response?.data?.role,
      response?.user?.role,
      response?.data?.user?.role,
      response?.authorities,
      response?.data?.authorities,
      response?.user?.authorities,
      response?.data?.user?.authorities,
      response?.roles,
      response?.data?.roles,
      response?.user?.roles,
      response?.data?.user?.roles
    ];

    return directRoles
      .flatMap((item) => {
        if (!item) return [];
        if (Array.isArray(item)) return item;
        return [item];
      })
      .map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item?.authority === 'string') return item.authority;
        if (typeof item?.role === 'string') return item.role;
        return '';
      })
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  };

  const isAdminFromResponse = (response) => {
    const roleValues = collectRoleValues(response);
    return roleValues.some((value) => value === 'admin' || value === 'role_admin');
  };

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = Math.floor(Math.random() * 3) + 6;
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

      if (!isAdminFromResponse(response)) {
        throw new Error('This account is not an admin account.');
      }

      const token = response?.token || response?.accessToken || response?.data?.token;
      if (!token) {
        throw new Error('No token received from server.');
      }

      saveSession({
        token,
        role: 'admin',
        admin: {
          email: formData.email.trim(),
          role: 'admin'
        }
      });

      navigate('/admin-dashboard');
    } catch (error) {
      setApiError(error.message || 'Invalid admin credentials!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">Access the admin dashboard</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {apiError && <div className="error-message">{apiError}</div>}
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@homevalue.com"
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
                placeholder="Enter admin password"
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
              {isLoading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;