import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('buyer' | 'supplier' | 'admin')[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedUserTypes = ['buyer', 'supplier', 'admin'],
  redirectTo = '/login'
}) => {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userType) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedUserTypes.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    const dashboardRoutes = {
      buyer: '/dashboard',
      supplier: '/supplier/dashboard',
      admin: '/admin'
    };
    return <Navigate to={dashboardRoutes[userType]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;