import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getRole, isAuthenticated } from '../services/auth';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const isLoggedIn = isAuthenticated();
  const isAdmin = getRole() === 'admin';

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