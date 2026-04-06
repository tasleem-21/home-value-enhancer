import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { deleteProperty, getAllProperties, updateProperty } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' or 'submissions'
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState(null);
  const [apiError, setApiError] = useState('');

  const getPropertyId = (property) => property?.id ?? property?._id ?? property?.propertyId;

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin-login');
    } else {
      loadRecommendations();
      loadUserSubmissions();
    }
  }, [navigate]);

  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setApiError('');
    try {
      const data = await getAllProperties();
      const items = Array.isArray(data) ? data : data?.data || [];
      setRecommendations(Array.isArray(items) ? items : []);
    } catch (error) {
      setRecommendations([]);
      setApiError(error.message || 'Unable to load recommendations.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const loadUserSubmissions = () => {
    const saved = localStorage.getItem('submissionHistory');
    if (saved) {
      setUserSubmissions(JSON.parse(saved));
    }
  };

  const handleDelete = async (item, index) => {
    if (window.confirm('Are you sure you want to delete this recommendation?')) {
      setApiError('');
      const propertyId = getPropertyId(item);
      if (propertyId === undefined || propertyId === null) {
        setApiError('Unable to delete recommendation: missing property ID.');
        return;
      }

      setDeletingPropertyId(propertyId);
      try {
        await deleteProperty(propertyId);
        const updated = recommendations.filter((_, i) => i !== index);
        setRecommendations(updated);
      } catch (error) {
        setApiError(error.message || 'Unable to delete recommendation.');
      } finally {
        setDeletingPropertyId(null);
      }
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditFormData({ ...recommendations[index] });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = async () => {
    const updated = [...recommendations];
    updated[editingIndex] = editFormData;
    setApiError('');
    const targetItem = recommendations[editingIndex];
    const targetId = getPropertyId(targetItem);
    if (targetId === undefined || targetId === null) {
      setApiError('Unable to update recommendation: missing property ID.');
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateProperty(targetId, editFormData);
      setRecommendations(updated);
      setEditingIndex(null);
      setEditFormData(null);
    } catch (error) {
      setApiError(error.message || 'Unable to update recommendation.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditFormData(null);
  };

  const handleDeleteSubmission = (id) => {
    if (window.confirm('Are you sure you want to delete this user submission?')) {
      const updated = userSubmissions.filter(item => item.id !== id);
      setUserSubmissions(updated);
      localStorage.setItem('submissionHistory', JSON.stringify(updated));
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

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage property improvement recommendations and user submissions</p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <h3>{recommendations.length}</h3>
            <p>Total Recommendations</p>
          </div>
          <div className="stat-card">
            <h3>{userSubmissions.length}</h3>
            <p>User Submissions</p>
          </div>
          <div className="stat-card">
            <h3>89</h3>
            <p>Properties Listed</p>
          </div>
          <div className="stat-card">
            <h3>4.8</h3>
            <p>Avg. Rating</p>
          </div>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            Manage Recommendations
          </button>
          <button 
            className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            User Submissions
          </button>
        </div>

        {activeTab === 'recommendations' && (
          <>
            <div className="admin-actions">
              <button className="btn btn-primary" onClick={() => navigate('/admin-add')}>
                + Add New Recommendation
              </button>
            </div>

            <div className="recommendations-table">
              <h2>Manage Recommendations</h2>
              {isLoadingRecommendations && <p className="no-data">Loading recommendations...</p>}
              {apiError && <p className="no-data">{apiError}</p>}
              {recommendations.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Cost Range</th>
                      <th>Impact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.map((rec, index) => (
                      <tr key={index}>
                        {editingIndex === index ? (
                          <>
                            <td>
                              <input
                                type="text"
                                name="title"
                                value={editFormData.title}
                                onChange={handleEditChange}
                                className="edit-input"
                              />
                            </td>
                            <td>
                              <select
                                name="category"
                                value={editFormData.category}
                                onChange={handleEditChange}
                                className="edit-input"
                              >
                                <option value="Interior">Interior</option>
                                <option value="Exterior">Exterior</option>
                                <option value="Kitchen">Kitchen</option>
                                <option value="Bathroom">Bathroom</option>
                                <option value="Flooring">Flooring</option>
                                <option value="Lighting">Lighting</option>
                                <option value="Technology">Technology</option>
                                <option value="Landscaping">Landscaping</option>
                              </select>
                            </td>
                            <td>
                              <select
                                name="costRange"
                                value={editFormData.costRange}
                                onChange={handleEditChange}
                                className="edit-input"
                              >
                                <option value="₹10,000 - ₹50,000">₹10,000 - ₹50,000</option>
                                <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                                <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                                <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                                <option value="₹5,00,000+">₹5,00,000+</option>
                              </select>
                            </td>
                            <td>
                              <select
                                name="impact"
                                value={editFormData.impact}
                                onChange={handleEditChange}
                                className="edit-input"
                              >
                                <option value="Low (1-3%)">Low (1-3%)</option>
                                <option value="Medium (3-7%)">Medium (3-7%)</option>
                                <option value="High (7-15%)">High (7-15%)</option>
                                <option value="Very High (15%+)">Very High (15%+)</option>
                              </select>
                            </td>
                            <td>
                              <button className="btn-save" onClick={handleSaveEdit}>
                                {isSavingEdit ? 'Saving...' : '✓ Save'}
                              </button>
                              <button className="btn-cancel" onClick={handleCancelEdit}>
                                ✗ Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{rec.title}</td>
                            <td>{rec.category}</td>
                            <td>{rec.costRange}</td>
                            <td>{rec.impact}</td>
                            <td>
                              <button className="btn-edit" onClick={() => handleEdit(index)}>
                                ✏️ Edit
                              </button>
                              <button className="btn-icon" onClick={() => handleDelete(rec, index)}>
                                {deletingPropertyId === getPropertyId(rec) ? 'Deleting...' : '🗑️ Delete'}
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No recommendations yet. Click "Add New Recommendation" to get started.</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'submissions' && (
          <div className="submissions-section">
            <h2>User Property Submissions</h2>
            {userSubmissions.length > 0 ? (
              <div className="submissions-grid">
                {userSubmissions.map((submission) => (
                  <div key={submission.id} className="submission-card">
                    <div className="submission-header">
                      <h4>{submission.propertyType} - {submission.bhk}</h4>
                      <span className="submission-date">{formatDate(submission.submittedAt)}</span>
                    </div>
                    <div className="submission-details">
                      <p><strong>Location:</strong> {submission.location}</p>
                      <p><strong>Area:</strong> {submission.area} sq. ft.</p>
                      <p><strong>Age:</strong> {submission.age}</p>
                      <p><strong>Budget:</strong> {submission.budget}</p>
                      <p><strong>Condition:</strong> {submission.currentCondition}</p>
                      <p><strong>Priority Area:</strong> {submission.priority}</p>
                    </div>
                    <div className="submission-actions">
                      <button 
                        className="btn-icon" 
                        onClick={() => handleDeleteSubmission(submission.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No user submissions yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;