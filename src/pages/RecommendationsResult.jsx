import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getAllProperties } from '../services/api';

const RecommendationsResult = () => {
  const navigate = useNavigate();
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState('');

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
    if (!costString) return 0;
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

  const generateRecommendations = async (details) => {
    const userBudget = parseBudget(details.budget);
    setIsLoadingRecommendations(true);
    setRecommendationsError('');
    try {
      const data = await getAllProperties();
      const allRecommendations = Array.isArray(data) ? data : data?.data || [];
      const filteredByBudget = allRecommendations.filter((rec) => {
        const costValue = rec.costRange || rec.cost || '';
        const recMaxCost = parseCost(costValue);
        return recMaxCost <= userBudget;
      });

      const sorted = filteredByBudget.sort((a, b) => {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        const aPriority = priorityOrder[a.priority] || 4;
        const bPriority = priorityOrder[b.priority] || 4;
        return aPriority - bPriority;
      });

      setRecommendations(sorted.slice(0, 6));
    } catch (error) {
      setRecommendations([]);
      setRecommendationsError(error.message || 'Unable to load recommendations right now.');
    } finally {
      setIsLoadingRecommendations(false);
    }
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
          {isLoadingRecommendations && <p className="no-data">Loading recommendations...</p>}
          {!isLoadingRecommendations && recommendationsError && <p className="no-data">{recommendationsError}</p>}
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item priority-${(rec.priority || 'Medium').toLowerCase()}`}>
                <div className="recommendation-header">
                  <h3>{rec.title}</h3>
                  <span className={`priority-badge ${(rec.priority || 'Medium').toLowerCase()}`}>
                    {rec.priority || 'Medium'} Priority
                  </span>
                </div>
                <p className="recommendation-desc">{rec.description}</p>
                <div className="recommendation-details">
                  <div className="detail-item">
                    <strong>💰 Cost:</strong> {rec.costRange || rec.cost}
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
            !isLoadingRecommendations &&
            !recommendationsError && (
              <p className="no-data">No recommendations found within your budget. Please try increasing your budget range.</p>
            )
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