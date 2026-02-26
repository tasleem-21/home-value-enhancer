import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple admin authentication (for demo)
    if (formData.email === 'admin@homevalue.com' && formData.password === 'admin123') {
      localStorage.setItem('admin', JSON.stringify({ email: formData.email, role: 'admin' }));
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