import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAdd from './pages/AdminAdd';
import RecommendationsForm from './pages/RecommendationsForm';
import RecommendationsResult from './pages/RecommendationsResult';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-add" element={<AdminAdd />} />
        <Route path="/recommendations-form" element={<RecommendationsForm />} />
        <Route path="/recommendations-result" element={<RecommendationsResult />} />
      </Routes>
    </Router>
  );
}

export default App;