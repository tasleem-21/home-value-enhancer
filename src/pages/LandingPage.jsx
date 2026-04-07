import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <Navbar />
      
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Transform Your Home's Value</h1>
          <p className="hero-subtitle">
            Personalized recommendations to enhance your residential property
          </p>
          <p className="hero-description">
            Tailored solutions for Indian middle-class homeowners to maximize property value
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>
              Get Started
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Smart Recommendations</h3>
            <p>Get personalized property enhancement ideas based on your home details</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Value Enhancement</h3>
            <p>Discover cost-effective ways to increase your property's market value</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Expert Insights</h3>
            <p>Access curated recommendations from property enhancement experts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Easy to Use</h3>
            <p>Simple interface to submit property details and receive instant suggestions</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 Home Value Enhancer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;