import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RequireRole from './components/RequireRole';
import { Toast } from './components/ui/toast';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SupplierRegisterPage from './pages/auth/SupplierRegisterPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRFQs from './pages/admin/AdminRFQs';

// Buyer pages
import BuyerDashboard from './pages/BuyerDashboard';

// Supplier pages
import SupplierDashboard from './pages/SupplierDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

function AppContent() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/supplier-register" element={<SupplierRegisterPage />} />

        {/* Protected Admin Routes */}
        <Route element={<RequireRole allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/rfqs" element={<AdminRFQs />} />
        </Route>

        {/* Protected Buyer Routes */}
        <Route element={<RequireRole allowedRoles={['buyer']} />}>
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/my-rfqs" element={<BuyerDashboard />} />
          <Route path="/create-rfq" element={<BuyerDashboard />} />
          <Route path="/orders" element={<BuyerDashboard />} />
          <Route path="/suppliers" element={<BuyerDashboard />} />
          <Route path="/messages" element={<BuyerDashboard />} />
          <Route path="/analytics" element={<BuyerDashboard />} />
          <Route path="/profile" element={<BuyerDashboard />} />
        </Route>

        {/* Protected Supplier Routes */}
        <Route element={<RequireRole allowedRoles={['supplier']} />}>
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier/quotations" element={<SupplierDashboard />} />
          <Route path="/supplier/drafts" element={<SupplierDashboard />} />
          <Route path="/supplier/orders" element={<SupplierDashboard />} />
          <Route path="/supplier/performance" element={<SupplierDashboard />} />
          <Route path="/supplier/profile" element={<SupplierDashboard />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={
          profile ? (
            profile.user_type === 'admin' ? <Navigate to="/admin" /> :
            profile.user_type === 'buyer' ? <Navigate to="/dashboard" /> :
            <Navigate to="/supplier/dashboard" />
          ) : <Navigate to="/" />
        } />
      </Routes>
      <Toast />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;