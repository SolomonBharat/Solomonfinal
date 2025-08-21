import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BuyerDashboard from './pages/BuyerDashboard';
import CreateRFQ from './pages/CreateRFQ';
import MyRFQs from './pages/MyRFQs';
import Profile from './pages/Profile';
import Messaging from './pages/Messaging';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Solomon Bharat...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={user ? <BuyerDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/my-rfqs" 
        element={user ? <MyRFQs /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/create-rfq" 
        element={user ? <CreateRFQ /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/profile" 
        element={user ? <Profile /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/messages" 
        element={user ? <Messaging /> : <Navigate to="/login" />} 
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;