import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          // Set the token in the API headers
          api.setAuthToken(token);
          
          // Check if this is a demo token
          if (token.startsWith('mock-bypass-token-')) {
            // For demo tokens, we already have the user data in localStorage
            const demoUserData = JSON.parse(localStorage.getItem('demoUser') || '{}');
            if (demoUserData.id) {
              setCurrentUser(demoUserData);
              setAuthLoading(false);
              return;
            }
          }
          
          // For real tokens, get user info from API
          try {
            const response = await api.get('/users/me');
            setCurrentUser(response.data.user);
          } catch (apiErr) {
            console.log('API error, using demo mode');
            // If API call fails but we have a token, create a mock user for demo
            if (token) {
              const demoUser = {
                id: 'demo-user-123',
                name: 'Demo User',
                email: 'demo@example.com',
                role: 'business',
                businessId: 'demo-business-456'
              };
              setCurrentUser(demoUser);
            }
          }
        } catch (err) {
          console.error('Authentication error:', err);
          // Don't clear token in demo mode
          if (!token.startsWith('mock-bypass-token-')) {
            localStorage.removeItem('token');
            setToken(null);
            setCurrentUser(null);
          }
        }
      }
      setAuthLoading(false);
    };

    checkLoggedIn();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const response = await api.post('/auth/register', userData);
      
      // Save token and set user
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setCurrentUser(response.data.user);
      
      // Set token in API headers
      api.setAuthToken(response.data.token);
      
      setAuthLoading(false);
      return response.data;
    } catch (err) {
      setAuthLoading(false);
      setError(
        err.response?.data?.error || 
        'An error occurred during registration. Please try again.'
      );
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      // In a real production app, this would make an actual API call
      // For development purposes, we're providing a bypass option
      
      const response = await api.post('/auth/login', credentials);
      
      // Save token and set user
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setCurrentUser(response.data.user);
      
      // Set token in API headers
      api.setAuthToken(response.data.token);
      
      setAuthLoading(false);
      return response.data;
    } catch (err) {
      setAuthLoading(false);
      setError(
        err.response?.data?.error || 
        'Invalid credentials. Please try again.'
      );
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    api.removeAuthToken();
    navigate('/login');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const response = await api.put('/users/profile', profileData);
      
      setCurrentUser({
        ...currentUser,
        ...response.data.user
      });
      
      setAuthLoading(false);
      return response.data;
    } catch (err) {
      setAuthLoading(false);
      setError(
        err.response?.data?.error || 
        'An error occurred while updating profile. Please try again.'
      );
      throw err;
    }
  };

  // For demo purposes - bypass authentication
  const setBypassAuth = (userData) => {
    // Create a mock token
    const mockToken = 'mock-bypass-token-' + Date.now();
    
    // Save both token and user data to localStorage
    localStorage.setItem('token', mockToken);
    localStorage.setItem('demoUser', JSON.stringify(userData));
    
    // Update state
    setToken(mockToken);
    setCurrentUser(userData);
    
    // Set up mock auth header
    api.setAuthToken(mockToken);
    
    // Dispatch an event to notify other components of auth change
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        authLoading,
        error,
        register,
        login,
        logout,
        updateProfile,
        setBypassAuth,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;