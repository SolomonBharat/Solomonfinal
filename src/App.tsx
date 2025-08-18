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
import AdminSupplierOnboarding from './pages/admin/AdminSupplierOnboarding';

// Buyer pages
import BuyerDashboard from './pages/BuyerDashboard';
import CreateRFQ from './pages/CreateRFQ';
import MyRFQs from './pages/MyRFQs';
import BuyerOrders from './pages/BuyerOrders';
import BuyerSuppliers from './pages/BuyerSuppliers';
import BuyerAnalytics from './pages/BuyerAnalytics';
import BuyerProfile from './pages/BuyerProfile';

// Supplier pages
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierQuotations from './pages/SupplierQuotations';
import SupplierOrders from './pages/SupplierOrders';
import SupplierPerformance from './pages/SupplierPerformance';
import SupplierProfile from './pages/SupplierProfile';
import SupplierSampleRequests from './pages/supplier/SupplierSampleRequests';
import SupplierSampleRequests from './pages/supplier/SupplierSampleRequests';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
          <Route path="/admin/onboard-supplier" element={<AdminSupplierOnboarding />} />
          <Route path="/admin/onboard-supplier" element={<AdminSupplierOnboarding />} />
        </Route>

        {/* Protected Buyer Routes */}
        <Route element={<RequireRole allowedRoles={['buyer']} />}>
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/create-rfq" element={<CreateRFQ />} />
          <Route path="/my-rfqs" element={<MyRFQs />} />
          <Route path="/orders" element={<BuyerOrders />} />
          <Route path="/suppliers" element={<BuyerSuppliers />} />
          <Route path="/analytics" element={<BuyerAnalytics />} />
          <Route path="/profile" element={<BuyerProfile />} />
        </Route>

        {/* Protected Supplier Routes */}
        <Route element={<RequireRole allowedRoles={['supplier']} />}>
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier/quotations" element={<SupplierQuotations />} />
          <Route path="/supplier/orders" element={<SupplierOrders />} />
          <Route path="/supplier/performance" element={<SupplierPerformance />} />
          <Route path="/supplier/profile" element={<SupplierProfile />} />
          <Route path="/supplier/sample-requests" element={<SupplierSampleRequests />} />
          <Route path="/supplier/sample-requests" element={<SupplierSampleRequests />} />
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