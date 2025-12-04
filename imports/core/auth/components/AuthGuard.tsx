import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAdmin = false,
  fallbackPath = '/login'
}) => {
  const { user, isLoading, hasPermissions, hasRole } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !user.profile.admin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permissions
  if (permissions.length > 0 && !hasPermissions(permissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check roles
  if (roles.length > 0 && !roles.some(role => hasRole(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
