import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

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

  const loadRecommendations = () => {
    const saved = localStorage.getItem('recommendations');
    if (saved) {
      setRecommendations(JSON.parse(saved));
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
            {recommendations.length > 0 ? (
              recommendations.slice(0, 6).map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                  <span className="recommendation-category">{rec.category}</span>
                </div>
              ))
            ) : (
              <>
                <div className="recommendation-card">
                  <h4>Fresh Paint</h4>
                  <p>A fresh coat of paint can increase property value by 2-5%</p>
                  <span className="recommendation-category">Interior</span>
                </div>
                <div className="recommendation-card">
                  <h4>Modular Kitchen</h4>
                  <p>Upgrade to a modern modular kitchen for better appeal</p>
                  <span className="recommendation-category">Kitchen</span>
                </div>
                <div className="recommendation-card">
                  <h4>Bathroom Renovation</h4>
                  <p>Modern fixtures and tiles enhance property value significantly</p>
                  <span className="recommendation-category">Bathroom</span>
                </div>
                <div className="recommendation-card">
                  <h4>Energy Efficient Windows</h4>
                  <p>Install double-glazed windows for better insulation</p>
                  <span className="recommendation-category">Windows</span>
                </div>
                <div className="recommendation-card">
                  <h4>Landscaping</h4>
                  <p>Well-maintained garden can add 5-10% to property value</p>
                  <span className="recommendation-category">Exterior</span>
                </div>
                <div className="recommendation-card">
                  <h4>Smart Home Features</h4>
                  <p>Add smart lighting and security systems</p>
                  <span className="recommendation-category">Technology</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;