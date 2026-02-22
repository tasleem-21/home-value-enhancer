import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    navigate('/');
  };

  const isLoggedIn = localStorage.getItem('user') || localStorage.getItem('admin');
  const isAdmin = localStorage.getItem('admin');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          🏡 Home Value Enhancer
        </div>
        
        <div className="navbar-links">
          {!isLoggedIn ? (
            <>
              <button className="nav-link" onClick={() => navigate('/login')}>
                User Login
              </button>
              <button className="nav-link" onClick={() => navigate('/admin-login')}>
                Admin Login
              </button>
              <button className="nav-link btn-signup" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/user-dashboard')}>
                Dashboard
              </button>
              <button className="nav-link btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;