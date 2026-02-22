import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const AdminAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    costRange: '',
    impact: '',
    timeframe: '',
    propertyType: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const existing = localStorage.getItem('recommendations');
    const recommendations = existing ? JSON.parse(existing) : [];
    recommendations.push(formData);
    localStorage.setItem('recommendations', JSON.stringify(recommendations));
    
    alert('Recommendation added successfully!');
    navigate('/admin-dashboard');
  };

  return (
    <div className="admin-add-page">
      <Navbar />
      
      <div className="admin-add-container">
        <div className="admin-add-header">
          <h1>Add New Recommendation</h1>
          <p>Create property improvement recommendations for users</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Recommendation Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Modern Modular Kitchen"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Interior">Interior</option>
                <option value="Exterior">Exterior</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Flooring">Flooring</option>
                <option value="Lighting">Lighting</option>
                <option value="Technology">Technology</option>
                <option value="Landscaping">Landscaping</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the improvement..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="costRange">Cost Range (₹) *</label>
              <select
                id="costRange"
                name="costRange"
                value={formData.costRange}
                onChange={handleChange}
                required
              >
                <option value="">Select Cost Range</option>
                <option value="₹10,000 - ₹50,000">₹10,000 - ₹50,000</option>
                <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                <option value="₹5,00,000+">₹5,00,000+</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="impact">Value Impact *</label>
              <select
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                required
              >
                <option value="">Select Impact</option>
                <option value="Low (1-3%)">Low (1-3%)</option>
                <option value="Medium (3-7%)">Medium (3-7%)</option>
                <option value="High (7-15%)">High (7-15%)</option>
                <option value="Very High (15%+)">Very High (15%+)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="timeframe">Completion Timeframe *</label>
              <select
                id="timeframe"
                name="timeframe"
                value={formData.timeframe}
                onChange={handleChange}
                required
              >
                <option value="">Select Timeframe</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="1-2 months">1-2 months</option>
                <option value="2-3 months">2-3 months</option>
                <option value="3-6 months">3-6 months</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="propertyType">Suitable Property Type *</label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                required
              >
                <option value="">Select Property Type</option>
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Villa">Villa</option>
                <option value="All">All Types</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin-dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Recommendation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAdd;