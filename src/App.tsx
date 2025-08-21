import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BuyerDashboard from './pages/BuyerDashboard';
import CreateRFQ from './pages/CreateRFQ';
import MatchingResults from './pages/MatchingResults';
import QuotationComparison from './pages/QuotationComparison';
import Messaging from './pages/Messaging';
import Profile from './pages/Profile';
import MyRFQs from './pages/MyRFQs';
import AdminDashboard from './pages/AdminDashboard';
import AdminSuppliers from './pages/AdminSuppliers';
import AdminRFQs from './pages/AdminRFQs';
import SupplierLogin from './pages/SupplierLogin';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierQuote from './pages/SupplierQuote';
import SupplierQuotations from './pages/SupplierQuotations';
import SupplierProfile from './pages/SupplierProfile';
import BuyerAnalytics from './pages/BuyerAnalytics';
import SupplierPerformance from './pages/SupplierPerformance';
import AdminAnalytics from './pages/AdminAnalytics';
import OnboardSupplier from './pages/OnboardSupplier';
import BuyerOrders from './pages/BuyerOrders';
import SupplierOrders from './pages/SupplierOrders';
import AdminSettings from './pages/AdminSettings';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={userType === 'admin' ? '/admin' : userType === 'supplier' ? '/supplier/dashboard' : '/dashboard'} replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={userType === 'admin' ? '/admin' : userType === 'supplier' ? '/supplier/dashboard' : '/dashboard'} replace />} />
      <Route path="/supplier/login" element={!user ? <SupplierLogin /> : <Navigate to={userType === 'supplier' ? '/supplier/dashboard' : userType === 'admin' ? '/admin' : '/dashboard'} replace />} />
      
      {/* Protected Buyer Routes */}
      <Route 
        path="/dashboard" 
        element={user && userType === 'buyer' ? <BuyerDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/my-rfqs" 
        element={user && userType === 'buyer' ? <MyRFQs /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/create-rfq" 
        element={user && userType === 'buyer' ? <CreateRFQ /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/rfq/:rfqId/suppliers" 
        element={user && userType === 'buyer' ? <MatchingResults /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/rfq/:rfqId/quotations" 
        element={user && userType === 'buyer' ? <QuotationComparison /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/messages" 
        element={user ? <Messaging /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/messages/:conversationId" 
        element={user ? <Messaging /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/profile" 
        element={user ? <Profile /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/analytics" 
        element={user && userType === 'buyer' ? <BuyerAnalytics /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/orders" 
        element={user && userType === 'buyer' ? <BuyerOrders /> : <Navigate to="/login" />} 
      />

      {/* Protected Supplier Routes */}
      <Route 
        path="/supplier/dashboard" 
        element={user && userType === 'supplier' ? <SupplierDashboard /> : <Navigate to="/supplier/login" />} 
      />
      <Route 
        path="/supplier/quotations" 
        element={user && userType === 'supplier' ? <SupplierQuotations /> : <Navigate to="/supplier/login" />} 
      />
      <Route 
        path="/supplier/profile" 
        element={user && userType === 'supplier' ? <SupplierProfile /> : <Navigate to="/supplier/login" />} 
      />
      <Route 
        path="/supplier/quote/:rfqId" 
        element={user && userType === 'supplier' ? <SupplierQuote /> : <Navigate to="/supplier/login" />} 
      />
      <Route 
        path="/supplier/quotations" 
        element={user && userType === 'supplier' ? <SupplierQuotations /> : <Navigate to="/supplier/login" />} 
      />
      <Route 
        path="/supplier/profile" 
        element={user && userType === 'supplier' ? <SupplierProfile /> : <Navigate to="/supplier/login" />} 
      />
      <Route 
        path="/supplier/performance" 
        element={user && userType === 'supplier' ? <SupplierPerformance /> : <Navigate to="/supplier/login" />} 
      />
      <Route 
        path="/supplier/orders" 
        element={user && userType === 'supplier' ? <SupplierOrders /> : <Navigate to="/supplier/login" />} 
      />

      {/* Protected Admin Routes */}
      <Route 
        path="/admin" 
        element={user && userType === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/suppliers" 
        element={user && userType === 'admin' ? <AdminSuppliers /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/rfqs" 
        element={user && userType === 'admin' ? <AdminRFQs /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/analytics" 
        element={user && userType === 'admin' ? <AdminAnalytics /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/admin/onboard-supplier" 
        element={user && userType === 'admin' ? <OnboardSupplier /> : <Navigate to="/login" replace />} 
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