import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protected Route component that redirects to login page if user is not authenticated.
 * Optionally redirects based on user role for role-specific routes.
 * 
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The child components to render when authenticated
 * @param {String} props.requiredRole - Optional role requirement for accessing the route
 * @param {String} props.redirectPath - Custom redirect path (defaults to /login)
 * @returns {React.ReactElement} - The rendered component
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  redirectPath = '/login'
}) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading state if auth is still being checked
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // If a specific role is required, check user's role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;