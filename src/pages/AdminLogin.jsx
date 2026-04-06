import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { saveSession } from '../services/auth';

const AdminLogin = () => {
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

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (captchaInput.trim().toUpperCase() !== captcha) {
      setErrors((prev) => ({ ...prev, captchaInput: 'Incorrect captcha. Please try again.' }));
      return;
    }
    
    // Simple admin authentication (for demo)
    if (formData.email === 'admin@homevalue.com' && formData.password === 'admin123') {
      saveSession({
        token: `admin-token-${Date.now()}`,
        role: 'admin',
        admin: { email: formData.email, role: 'admin' }
      });
      navigate('/admin-dashboard');
    } else {
      alert('Invalid admin credentials!');
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

            <button type="submit" className="btn btn-primary btn-full">
              Login as Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;