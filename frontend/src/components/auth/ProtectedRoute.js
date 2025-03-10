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
  const { isAuthenticated, currentUser, authLoading } = useAuth();
  const location = useLocation();
  
  // In development mode, always allow access regardless of authentication
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Show loading state if auth is still being checked (but not in development)
  if (authLoading && !isDevelopment) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }
  
  // Check if user is authenticated (skip in development)
  if (!isAuthenticated && !isDevelopment) {
    // Redirect to login, but save the attempted location
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // If a specific role is required, check user's role (skip in development)
  if (requiredRole && currentUser?.role !== requiredRole && !isDevelopment) {
    // Special case: if the route requires 'client' role and the user is 'admin',
    // allow access as admin can view client-specific routes
    if (!(requiredRole === 'client' && currentUser?.role === 'admin')) {
      // Redirect based on role
      if (currentUser?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (currentUser?.role === 'business') {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/appointments" replace />;
      }
    }
  }
  
  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;