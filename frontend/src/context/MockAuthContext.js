import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Create context
const MockAuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const MockAuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Mock user
  const mockUser = {
    userId: 'demo-user',
    name: 'Demo Business',
    email: 'demo@example.com',
    role: 'service_provider'
  };

  // Mock logout function
  const logout = () => {
    navigate('/');
    window.location.reload();
  };

  // Context value
  const value = {
    currentUser: mockUser,
    isAuthenticated: true,
    authLoading: false,
    error: null,
    logout
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export default MockAuthContext;