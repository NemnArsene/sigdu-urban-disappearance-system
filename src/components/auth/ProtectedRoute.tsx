import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { hasAccess, RoleRoutes } from '../../lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess(user.role, location.pathname)) {
    // Redirect to their designated dashboard if they try to access unauthorized areas
    return <Navigate to={RoleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
};
