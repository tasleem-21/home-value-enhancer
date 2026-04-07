import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { addProperty } from '../services/api';

const RECENT_RECOMMENDATION_KEY = 'recentlyAddedRecommendation';

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
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateField = (name, value) => {
    if (!String(value).trim()) return 'This field is required.';
    return '';
  };

  const validateForm = () => {
    const nextErrors = Object.keys(formData).reduce((acc, key) => {
      acc[key] = validateField(key, formData[key]);
      return acc;
    }, {});

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

    setApiError('');
    setIsLoading(true);
    try {
      const createdRecommendation = await addProperty(formData);
      if (createdRecommendation) {
        localStorage.setItem(RECENT_RECOMMENDATION_KEY, JSON.stringify(createdRecommendation));
      }
      alert('Recommendation added successfully!');
      navigate('/admin-dashboard');
    } catch (error) {
      setApiError(error.message || 'Failed to add recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          {apiError && <p>{apiError}</p>}
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
              {errors.title && <p>{errors.title}</p>}
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
              {errors.category && <p>{errors.category}</p>}
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
            {errors.description && <p>{errors.description}</p>}
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
              {errors.costRange && <p>{errors.costRange}</p>}
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
              {errors.impact && <p>{errors.impact}</p>}
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
              {errors.timeframe && <p>{errors.timeframe}</p>}
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
              {errors.propertyType && <p>{errors.propertyType}</p>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin-dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              Add Recommendation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAdd;