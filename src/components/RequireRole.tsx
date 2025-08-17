import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RequireRoleProps {
  allowedRoles: Array<'admin' | 'buyer' | 'supplier'>;
  fallbackPath?: string;
}

const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, fallbackPath }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.user_type)) {
    // Redirect to appropriate dashboard based on user role
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    
    switch (profile.user_type) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'buyer':
        return <Navigate to="/dashboard" replace />;
      case 'supplier':
        return <Navigate to="/supplier/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default RequireRole;