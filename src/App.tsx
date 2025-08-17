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
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminQuotationModeration from './pages/admin/AdminQuotationModeration';
import AdminSampleRequests from './pages/admin/AdminSampleRequests';
import AdminCategoryManagement from './pages/admin/AdminCategoryManagement';

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import CreateRFQ from './pages/buyer/CreateRFQ';
import QuotationComparison from './pages/buyer/QuotationComparison';

// Supplier pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierQuote from './pages/supplier/SupplierQuote';

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
          <Route path="/admin/suppliers" element={<AdminSuppliers />} />
          <Route path="/admin/quotations" element={<AdminQuotationModeration />} />
          <Route path="/admin/samples" element={<AdminSampleRequests />} />
          <Route path="/admin/categories" element={<AdminCategoryManagement />} />
        </Route>

        {/* Protected Buyer Routes */}
        <Route element={<RequireRole allowedRoles={['buyer']} />}>
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/create-rfq" element={<CreateRFQ />} />
          <Route path="/rfq/:rfqId/quotes" element={<QuotationComparison />} />
        </Route>

        {/* Protected Supplier Routes */}
        <Route element={<RequireRole allowedRoles={['supplier']} />}>
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier/rfq/:rfqId/quote" element={<SupplierQuote />} />
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