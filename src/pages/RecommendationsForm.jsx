import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const RecommendationsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyType: '',
    bhk: '',
    area: '',
    age: '',
    budget: '',
    location: '',
    currentCondition: '',
    priority: ''
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    if (!String(value).trim()) return 'This field is required.';
    if (name === 'area' && Number(value) <= 0) return 'Please enter a valid area.';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    localStorage.setItem('propertyDetails', JSON.stringify(formData));
    navigate('/recommendations-result');
  };

  return (
    <div className="recommendations-form-page">
      <Navbar />
      
      <div className="form-container">
        <div className="form-header">
          <h1>Get Personalized Recommendations</h1>
          <p>Tell us about your property to receive tailored enhancement suggestions</p>
        </div>

        <form onSubmit={handleSubmit} className="property-form">
          <div className="form-section">
            <h3>Property Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="propertyType">Property Type *</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Villa">Villa</option>
                  <option value="Row House">Row House</option>
                </select>
                {errors.propertyType && <p>{errors.propertyType}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="bhk">BHK Configuration *</label>
                <select
                  id="bhk"
                  name="bhk"
                  value={formData.bhk}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select BHK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="4+ BHK">4+ BHK</option>
                </select>
                {errors.bhk && <p>{errors.bhk}</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="area">Carpet Area (sq. ft.) *</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., 1200"
                  required
                />
                {errors.area && <p>{errors.area}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="age">Property Age (years) *</label>
                <select
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Age</option>
                  <option value="0-5 years">0-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10-15 years">10-15 years</option>
                  <option value="15-20 years">15-20 years</option>
                  <option value="20+ years">20+ years</option>
                </select>
                {errors.age && <p>{errors.age}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location (City) *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                required
              />
              {errors.location && <p>{errors.location}</p>}
            </div>
          </div>

          <div className="form-section">
            <h3>Enhancement Preferences</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget">Improvement Budget (₹) *</label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Budget</option>
                  <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                  <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                  <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                  <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</option>
                  <option value="₹10,00,000+">₹10,00,000+</option>
                </select>
                {errors.budget && <p>{errors.budget}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="currentCondition">Current Condition *</label>
                <select
                  id="currentCondition"
                  name="currentCondition"
                  value={formData.currentCondition}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Condition</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Renovation">Needs Renovation</option>
                  <option value="Poor">Poor</option>
                </select>
                {errors.currentCondition && <p>{errors.currentCondition}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority Area *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="">Select Priority</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Bathrooms">Bathrooms</option>
                <option value="Flooring">Flooring</option>
                <option value="Paint & Walls">Paint & Walls</option>
                <option value="Lighting">Lighting</option>
                <option value="Exterior">Exterior</option>
                <option value="All Areas">All Areas</option>
              </select>
              {errors.priority && <p>{errors.priority}</p>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/user-dashboard')}>
              Back to Dashboard
            </button>
            <button type="submit" className="btn btn-primary">
              Get Recommendations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecommendationsForm;