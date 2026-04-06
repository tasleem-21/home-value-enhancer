import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAdd from './pages/AdminAdd';
import RecommendationsForm from './pages/RecommendationsForm';
import RecommendationsResult from './pages/RecommendationsResult';
import { getRole, isAuthenticated } from './services/auth';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = getRole();
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-add"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations-form"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <RecommendationsForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations-result"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <RecommendationsResult />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;