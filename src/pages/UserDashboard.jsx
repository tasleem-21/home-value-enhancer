import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getAllProperties } from '../services/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      loadRecommendations();
      loadHistory();
    }
  }, [navigate]);

  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setRecommendationsError('');
    try {
      const data = await getAllProperties();
      const items = Array.isArray(data) ? data : data?.data || [];
      setRecommendations(Array.isArray(items) ? items : []);
    } catch (error) {
      setRecommendations([]);
      setRecommendationsError(error.message || 'Unable to load recommendations right now.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const loadHistory = () => {
    const saved = localStorage.getItem('submissionHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewHistory = () => {
    setShowHistory(!showHistory);
    loadHistory();
  };

  const handleDeleteHistory = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('submissionHistory', JSON.stringify(updated));
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || user?.email}!</h1>
          <p>Enhance your property value with personalized recommendations</p>
        </div>

        <div className="dashboard-actions">
          <div className="action-card" onClick={() => navigate('/recommendations-form')}>
            <div className="action-icon">📝</div>
            <h3>Get Recommendations</h3>
            <p>Submit your property details for personalized suggestions</p>
            <button className="btn btn-primary">Start Now</button>
          </div>

          <div className="action-card" onClick={handleViewHistory}>
            <div className="action-icon">📊</div>
            <h3>My Submissions</h3>
            <p>View your previous property submissions and recommendations</p>
            <button className="btn btn-secondary">View History ({history.length})</button>
          </div>
        </div>

        {/* History Section */}
        {showHistory && (
          <div className="history-section">
            <div className="history-header">
              <h2>Submission History</h2>
              <button className="btn btn-secondary" onClick={() => setShowHistory(false)}>
                Close
              </button>
            </div>
            
            {history.length > 0 ? (
              <div className="history-grid">
                {history.map((item) => (
                  <div key={item.id} className="history-card">
                    <div className="history-card-header">
                      <h4>{item.propertyType} - {item.bhk}</h4>
                      <span className="history-date">{formatDate(item.submittedAt)}</span>
                    </div>
                    <div className="history-details">
                      <p><strong>Location:</strong> {item.location}</p>
                      <p><strong>Area:</strong> {item.area} sq. ft.</p>
                      <p><strong>Age:</strong> {item.age}</p>
                      <p><strong>Budget:</strong> {item.budget}</p>
                      <p><strong>Condition:</strong> {item.currentCondition}</p>
                      <p><strong>Priority:</strong> {item.priority}</p>
                    </div>
                    <div className="history-actions">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => {
                          localStorage.setItem('propertyDetails', JSON.stringify(item));
                          navigate('/recommendations-result');
                        }}
                      >
                        View Recommendations
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleDeleteHistory(item.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No submission history yet. Submit your property details to get started!</p>
            )}
          </div>
        )}

        <div className="recommendations-section">
          <h2>Popular Enhancement Ideas</h2>
          <div className="recommendations-grid">
            {isLoadingRecommendations && <p className="no-data">Loading recommendations...</p>}
            {!isLoadingRecommendations && recommendationsError && <p className="no-data">{recommendationsError}</p>}
            {recommendations.length > 0 ? (
              recommendations.slice(0, 6).map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                  <span className="recommendation-category">{rec.category}</span>
                </div>
              ))
            ) : (
              !isLoadingRecommendations && !recommendationsError && <p className="no-data">No recommendations found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;