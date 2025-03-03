import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

/**
 * ProtectedRoute component to restrict access to authenticated users
 * Optionally checks for specific role if roleRequired is provided
 */
const ProtectedRoute = ({ children, roleRequired }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role check is required, verify user has correct role
  if (roleRequired && user?.role !== roleRequired) {
    // Allow admins to access any protected route
    if (user?.role === 'admin') {
      return children;
    }
    
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;