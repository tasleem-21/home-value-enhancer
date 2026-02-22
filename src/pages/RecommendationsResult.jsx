import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const RecommendationsResult = () => {
  const navigate = useNavigate();
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const details = localStorage.getItem('propertyDetails');
    if (!details) {
      navigate('/recommendations-form');
    } else {
      const parsedDetails = JSON.parse(details);
      setPropertyDetails(parsedDetails);
      
      // Save to history
      saveToHistory(parsedDetails);
      
      // Generate recommendations
      generateRecommendations(parsedDetails);
    }
  }, [navigate]);

  const saveToHistory = (details) => {
    const history = localStorage.getItem('submissionHistory');
    const historyArray = history ? JSON.parse(history) : [];
    
    const newSubmission = {
      ...details,
      submittedAt: new Date().toISOString(),
      id: Date.now()
    };
    
    historyArray.unshift(newSubmission); // Add to beginning
    localStorage.setItem('submissionHistory', JSON.stringify(historyArray));
  };

  const parseBudget = (budgetString) => {
    // Extract max value from budget string like "₹50,000 - ₹1,00,000"
    if (budgetString.includes('+')) {
      return 10000000; // If budget is "10,00,000+", set very high limit
    }
    const parts = budgetString.split(' - ');
    if (parts.length === 2) {
      // Extract numbers from "₹1,00,000" format
      const maxBudget = parts[1].replace(/₹|,/g, '');
      return parseInt(maxBudget);
    }
    return 10000000; // Default high value
  };

  const parseCost = (costString) => {
    // Extract max value from cost string like "₹50,000 - ₹1,00,000"
    if (costString.includes('+')) {
      const minCost = costString.split('+')[0].replace(/₹|,/g, '');
      return parseInt(minCost);
    }
    const parts = costString.split(' - ');
    if (parts.length === 2) {
      const maxCost = parts[1].replace(/₹|,/g, '');
      return parseInt(maxCost);
    }
    return 0;
  };

  const generateRecommendations = (details) => {
    const userBudget = parseBudget(details.budget);
    
    const allRecommendations = [
      {
        title: 'Fresh Paint & Wall Treatment',
        description: 'Apply fresh coat of paint with neutral colors to make your home look modern and well-maintained.',
        impact: 'High (7-15%)',
        cost: '₹30,000 - ₹80,000',
        timeframe: '2-3 weeks',
        priority: details.priority === 'Paint & Walls' ? 'High' : 'Medium'
      },
      {
        title: 'LED Lighting Installation',
        description: 'Replace old lights with energy-efficient LED fixtures and add ambient lighting.',
        impact: 'Medium (3-7%)',
        cost: '₹25,000 - ₹75,000',
        timeframe: '1-2 weeks',
        priority: details.priority === 'Lighting' ? 'High' : 'Low'
      },
      {
        title: 'Bathroom Fixtures Upgrade',
        description: 'Replace old taps, showerheads, and add modern bathroom accessories.',
        impact: 'Medium (3-7%)',
        cost: '₹40,000 - ₹90,000',
        timeframe: '2-3 weeks',
        priority: details.priority === 'Bathrooms' ? 'High' : 'Medium'
      },
      {
        title: 'Modular Kitchen Upgrade',
        description: 'Install a modern modular kitchen with granite countertops and efficient storage solutions.',
        impact: 'Very High (15%+)',
        cost: '₹2,50,000 - ₹5,00,000',
        timeframe: '1-2 months',
        priority: details.priority === 'Kitchen' ? 'High' : 'Medium'
      },
      {
        title: 'Full Bathroom Modernization',
        description: 'Complete bathroom renovation with modern fixtures, designer tiles, and improved plumbing.',
        impact: 'High (7-15%)',
        cost: '₹1,00,000 - ₹2,50,000',
        timeframe: '3-4 weeks',
        priority: details.priority === 'Bathrooms' ? 'High' : 'Medium'
      },
      {
        title: 'Premium Flooring Upgrade',
        description: 'Install premium tiles or wooden flooring to enhance aesthetics and durability.',
        impact: 'High (7-15%)',
        cost: '₹1,50,000 - ₹3,00,000',
        timeframe: '2-3 weeks',
        priority: details.priority === 'Flooring' ? 'High' : 'Medium'
      },
      {
        title: 'Basic Flooring Repair',
        description: 'Repair and polish existing flooring or install cost-effective tiles.',
        impact: 'Medium (3-7%)',
        cost: '₹40,000 - ₹90,000',
        timeframe: '1-2 weeks',
        priority: details.priority === 'Flooring' ? 'High' : 'Medium'
      },
      {
        title: 'Smart Home Integration',
        description: 'Add smart switches, doorbell, and security cameras for modern appeal.',
        impact: 'Medium (3-7%)',
        cost: '₹50,000 - ₹1,50,000',
        timeframe: '1 week',
        priority: 'Medium'
      },
      {
        title: 'Basic Smart Features',
        description: 'Install smart lighting and basic automation within budget.',
        impact: 'Low (1-3%)',
        cost: '₹20,000 - ₹60,000',
        timeframe: '3-5 days',
        priority: 'Low'
      },
      {
        title: 'Balcony & Window Enhancement',
        description: 'Install planters, improve railings, and add weather-resistant treatments.',
        impact: 'Medium (3-7%)',
        cost: '₹30,000 - ₹80,000',
        timeframe: '2 weeks',
        priority: details.priority === 'Exterior' ? 'High' : 'Low'
      },
      {
        title: 'Storage Solutions',
        description: 'Add built-in wardrobes, loft storage, and organized cabinets.',
        impact: 'Medium (3-7%)',
        cost: '₹75,000 - ₹1,50,000',
        timeframe: '3-4 weeks',
        priority: 'Medium'
      },
      {
        title: 'Basic Storage Addition',
        description: 'Install simple wardrobes and shelving units for better organization.',
        impact: 'Low (1-3%)',
        cost: '₹25,000 - ₹70,000',
        timeframe: '1-2 weeks',
        priority: 'Low'
      },
      {
        title: 'Kitchen Cabinet Refresh',
        description: 'Repaint or replace kitchen cabinet doors and upgrade hardware.',
        impact: 'Medium (3-7%)',
        cost: '₹40,000 - ₹95,000',
        timeframe: '2-3 weeks',
        priority: details.priority === 'Kitchen' ? 'High' : 'Medium'
      },
      {
        title: 'Electrical Upgrades',
        description: 'Update electrical wiring, add new power points, and improve safety.',
        impact: 'Medium (3-7%)',
        cost: '₹35,000 - ₹85,000',
        timeframe: '1-2 weeks',
        priority: 'Medium'
      },
      {
        title: 'Door & Window Upgrade',
        description: 'Replace old doors and windows with modern, secure options.',
        impact: 'High (7-15%)',
        cost: '₹60,000 - ₹1,80,000',
        timeframe: '2-3 weeks',
        priority: 'Medium'
      }
    ];

    // Filter recommendations based on budget
    const filteredByBudget = allRecommendations.filter(rec => {
      const recMaxCost = parseCost(rec.cost);
      return recMaxCost <= userBudget;
    });

    // Sort by priority (High first, then Medium, then Low)
    const sorted = filteredByBudget.sort((a, b) => {
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Return top 6 recommendations
    setRecommendations(sorted.slice(0, 6));
  };

  return (
    <div className="recommendations-result-page">
      <Navbar />
      
      <div className="result-container">
        <div className="result-header">
          <h1>Your Personalized Recommendations</h1>
          <p>Based on your property details and budget, here are tailored suggestions</p>
        </div>

        {propertyDetails && (
          <div className="property-summary">
            <h3>Property Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>Type:</strong> {propertyDetails.propertyType}
              </div>
              <div className="summary-item">
                <strong>Size:</strong> {propertyDetails.bhk}
              </div>
              <div className="summary-item">
                <strong>Area:</strong> {propertyDetails.area} sq. ft.
              </div>
              <div className="summary-item">
                <strong>Age:</strong> {propertyDetails.age}
              </div>
              <div className="summary-item">
                <strong>Budget:</strong> {propertyDetails.budget}
              </div>
              <div className="summary-item">
                <strong>Condition:</strong> {propertyDetails.currentCondition}
              </div>
            </div>
          </div>
        )}

        <div className="recommendations-list">
          <h2>Recommended Improvements (Within Your Budget)</h2>
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item priority-${rec.priority.toLowerCase()}`}>
                <div className="recommendation-header">
                  <h3>{rec.title}</h3>
                  <span className={`priority-badge ${rec.priority.toLowerCase()}`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="recommendation-desc">{rec.description}</p>
                <div className="recommendation-details">
                  <div className="detail-item">
                    <strong>💰 Cost:</strong> {rec.cost}
                  </div>
                  <div className="detail-item">
                    <strong>📈 Impact:</strong> {rec.impact}
                  </div>
                  <div className="detail-item">
                    <strong>⏱️ Time:</strong> {rec.timeframe}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No recommendations found within your budget. Please try increasing your budget range.</p>
          )}
        </div>

        <div className="result-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/recommendations-form')}>
            Submit Another Property
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/user-dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsResult;