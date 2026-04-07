import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getAllProperties } from '../services/api';

const USER_HISTORY_KEY = 'submissionHistoryByUser';

const getUserHistoryStore = () => {
  try {
    const raw = localStorage.getItem(USER_HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const getCurrentUserKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id?.toString() || user?.email?.toLowerCase() || 'anonymous';
  } catch {
    return 'anonymous';
  }
};

const getSubmissionFingerprint = (details = {}) => {
  const fingerprintPayload = {
    propertyType: details.propertyType,
    bhk: details.bhk,
    area: details.area,
    age: details.age,
    budget: details.budget,
    location: details.location,
    currentCondition: details.currentCondition,
    priority: details.priority
  };
  return JSON.stringify(fingerprintPayload);
};

const normalizeText = (value = '') => value.toString().trim().toLowerCase();

const parseCurrencyValue = (value = '') => {
  const numeric = value.toString().replace(/[^0-9]/g, '');
  return numeric ? Number.parseInt(numeric, 10) : 0;
};

const parseRange = (value = '') => {
  const text = value.toString();
  if (!text) return { min: 0, max: 0 };

  if (text.includes('+')) {
    const min = parseCurrencyValue(text);
    return { min, max: Number.POSITIVE_INFINITY };
  }

  const parts = text.split(' - ');
  if (parts.length === 2) {
    return {
      min: parseCurrencyValue(parts[0]),
      max: parseCurrencyValue(parts[1])
    };
  }

  const exactValue = parseCurrencyValue(text);
  return { min: exactValue, max: exactValue };
};

const isAllType = (value = '') => normalizeText(value) === 'all';

const matchesPropertyType = (recommendationType, userType) => {
  if (!userType) return true;
  if (!recommendationType || isAllType(recommendationType)) return true;
  return normalizeText(recommendationType) === normalizeText(userType);
};

const normalizeCategory = (value = '') => {
  const normalized = normalizeText(value).replace(/&/g, 'and');
  if (normalized === 'bathrooms') return 'bathroom';
  if (normalized === 'all areas') return 'all';
  return normalized;
};

const matchesPriority = (category, priority) => {
  if (!priority) return true;
  const normalizedCategory = normalizeCategory(category);
  const normalizedPriority = normalizeCategory(priority);
  if (normalizedPriority === 'all') return true;
  return normalizedCategory === normalizedPriority;
};

const getAgeValue = (age = '') => {
  const text = normalizeText(age);
  if (text.includes('0-5')) return 3;
  if (text.includes('5-10')) return 8;
  if (text.includes('10-15')) return 13;
  if (text.includes('15-20')) return 18;
  if (text.includes('20+')) return 25;
  return 0;
};

const getConditionPreference = (condition = '') => {
  const text = normalizeText(condition);
  if (text === 'poor' || text === 'needs renovation') return 'high';
  if (text === 'average') return 'medium';
  return 'low';
};

const getImpactLevel = (impact = '') => {
  const text = normalizeText(impact);
  if (text.includes('very high')) return 4;
  if (text.includes('high')) return 3;
  if (text.includes('medium')) return 2;
  if (text.includes('low')) return 1;
  return 2;
};

const estimateScore = (recommendation, details, budgetMax) => {
  const scoreParts = [];
  const recommendationCategory = normalizeCategory(recommendation.category);
  const userPriority = normalizeCategory(details.priority);
  const recommendationType = recommendation.propertyType;
  const { min: recommendationMin, max: recommendationMax } = parseRange(recommendation.costRange || recommendation.cost || '');

  if (matchesPropertyType(recommendationType, details.propertyType)) {
    scoreParts.push(4);
  }

  if (matchesPriority(recommendationCategory, userPriority)) {
    scoreParts.push(4);
  }

  if (recommendationMin <= budgetMax) {
    scoreParts.push(recommendationMax <= budgetMax ? 3 : 1);
  }

  const ageYears = getAgeValue(details.age);
  if (ageYears >= 15 && ['paint and walls', 'paint', 'flooring', 'bathroom', 'exterior'].includes(recommendationCategory)) {
    scoreParts.push(2);
  }
  if (ageYears <= 5 && ['lighting', 'technology', 'interior'].includes(recommendationCategory)) {
    scoreParts.push(1);
  }

  const conditionPreference = getConditionPreference(details.currentCondition);
  const impactLevel = getImpactLevel(recommendation.impact);
  if (conditionPreference === 'high' && impactLevel >= 3) {
    scoreParts.push(2);
  } else if (conditionPreference === 'medium' && impactLevel >= 2) {
    scoreParts.push(1);
  } else if (conditionPreference === 'low' && impactLevel <= 2) {
    scoreParts.push(1);
  }

  const bhkText = normalizeText(details.bhk);
  if (bhkText.includes('4+') && ['kitchen', 'bathroom', 'flooring', 'lighting'].includes(recommendationCategory)) {
    scoreParts.push(1);
  }

  const areaValue = Number.parseInt(details.area, 10) || 0;
  if (areaValue >= 1500 && ['exterior', 'landscaping', 'lighting'].includes(recommendationCategory)) {
    scoreParts.push(1);
  }

  return scoreParts.reduce((total, current) => total + current, 0);
};

const RecommendationsResult = () => {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState('');

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

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
    if (details?.id && details?.submittedAt) {
      return;
    }

    const userKey = getCurrentUserKey();
    const historyStore = getUserHistoryStore();
    const historyArray = Array.isArray(historyStore[userKey]) ? historyStore[userKey] : [];
    const nextFingerprint = getSubmissionFingerprint(details);

    const isDuplicate = historyArray.some((entry) => getSubmissionFingerprint(entry) === nextFingerprint);
    if (isDuplicate) {
      return;
    }
    
    const newSubmission = {
      ...details,
      submittedAt: new Date().toISOString(),
      id: Date.now(),
      userKey
    };

    historyArray.unshift(newSubmission); // Add to beginning

    historyStore[userKey] = historyArray;
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(historyStore));
  };

  const parseBudget = (budgetString) => {
    // Extract max value from budget string like "₹50,000 - ₹1,00,000"
    if (budgetString.includes('+')) {
      return { min: parseCurrencyValue(budgetString), max: Number.POSITIVE_INFINITY };
    }
    const parts = budgetString.split(' - ');
    if (parts.length === 2) {
      return {
        min: parseCurrencyValue(parts[0]),
        max: parseCurrencyValue(parts[1])
      };
    }
    const exactValue = parseCurrencyValue(budgetString);
    return { min: exactValue, max: exactValue };
  };

  const generateRecommendations = async (details) => {
    const { max: userBudgetMax } = parseBudget(details.budget);
    setIsLoadingRecommendations(true);
    setRecommendationsError('');
    try {
      const data = await getAllProperties();
      const allRecommendations = Array.isArray(data) ? data : data?.data || [];
      const scoredRecommendations = allRecommendations
        .map((rec) => {
          const { min: recMinCost, max: recMaxCost } = parseRange(rec.costRange || rec.cost || '');
          const withinBudget = recMinCost <= userBudgetMax;
          return {
            ...rec,
            __score: estimateScore(rec, details, userBudgetMax),
            __withinBudget: withinBudget,
            __minCost: recMinCost,
            __maxCost: recMaxCost
          };
        })
        .filter((rec) => rec.__withinBudget);

      const exactMatches = scoredRecommendations.filter((rec) => {
        const propertyTypeMatch = matchesPropertyType(rec.propertyType, details.propertyType);
        const priorityMatch = matchesPriority(rec.category, details.priority);
        return propertyTypeMatch && priorityMatch;
      });

      const source = exactMatches.length > 0 ? exactMatches : scoredRecommendations;
      const sorted = source.sort((a, b) => {
        if (b.__score !== a.__score) return b.__score - a.__score;
        if (a.__minCost !== b.__minCost) return a.__minCost - b.__minCost;
        return a.__maxCost - b.__maxCost;
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
                  {rec.propertyType && rec.propertyType !== 'All' && (
                    <div className="detail-item">
                      <strong>🏠 Suitable For:</strong> {rec.propertyType}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            !isLoadingRecommendations &&
            !recommendationsError && (
              <p className="no-data">No matching recommendations found for the selected inputs.</p>
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