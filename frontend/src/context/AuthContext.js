import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import supabaseService from '../services/supabaseService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      // Get current session from Supabase
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        
        try {
          // Get user profile data
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Get additional user data from profiles table
            const { data: userData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (profileError) {
              console.error('Error fetching user profile:', profileError);
              // Create a fallback user object with minimal data
              setCurrentUser({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || 'User',
                role: user.user_metadata?.role || 'client',
              });
            } else {
              // Create a complete user object
              setCurrentUser({
                id: user.id,
                email: user.email,
                name: userData.name || user.user_metadata?.name,
                role: userData.role || user.user_metadata?.role || 'client',
                phone: userData.phone,
                avatar: userData.avatar_url,
                address: {
                  street: userData.street,
                  city: userData.city,
                  state: userData.state,
                  zipCode: userData.zip_code,
                  country: userData.country
                },
                businessName: userData.business_name,
                businessCategory: userData.business_category,
                isVerified: user.email_confirmed_at ? true : false,
              });
            }
          }
        } catch (err) {
          console.error('Error getting user details:', err);
        }
      }
      
      setAuthLoading(false);
    };
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          try {
            // Get user profile data
            const { data: { user } } = await supabase.auth.getUser(newSession.access_token);
            
            if (user) {
              // Get additional user data from profiles table
              const { data: userData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
                
              if (profileError) {
                console.error('Error fetching user profile on sign in:', profileError);
                setCurrentUser({
                  id: user.id,
                  email: user.email,
                  name: user.user_metadata?.name || 'User',
                  role: user.user_metadata?.role || 'client',
                });
              } else {
                setCurrentUser({
                  id: user.id,
                  email: user.email,
                  name: userData.name || user.user_metadata?.name,
                  role: userData.role || user.user_metadata?.role || 'client',
                  phone: userData.phone,
                  avatar: userData.avatar_url,
                  address: {
                    street: userData.street,
                    city: userData.city,
                    state: userData.state,
                    zipCode: userData.zip_code,
                    country: userData.country
                  },
                  businessName: userData.business_name,
                  businessCategory: userData.business_category,
                  isVerified: user.email_confirmed_at ? true : false,
                });
              }
            }
          } catch (err) {
            console.error('Error getting user details on auth change:', err);
          }
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setCurrentUser(null);
          setSession(null);
        }
      }
    );
    
    checkSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const result = await supabaseService.auth.register(userData);
      
      setSession(result.session);
      setCurrentUser(result.user);
      
      setAuthLoading(false);
      return result;
    } catch (err) {
      setAuthLoading(false);
      setError(err.message || 'An error occurred during registration. Please try again.');
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      // Validate credentials
      if (!credentials.email) {
        throw new Error('Email is required');
      }
      
      if (!credentials.password) {
        throw new Error('Password is required');
      }
      
      console.log('AuthContext: Attempting login with email:', credentials.email);
      
      const result = await supabaseService.auth.login(credentials);
      
      setSession(result.session);
      setCurrentUser(result.user);
      
      setAuthLoading(false);
      return { success: true, user: result.user };
    } catch (err) {
      setAuthLoading(false);
      setError(err.message || 'Invalid credentials. Please try again.');
      console.error('Login failed:', err.message);
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await supabaseService.auth.logout();
      setSession(null);
      setCurrentUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setAuthLoading(true);
      
      const result = await supabaseService.users.updateProfile(profileData);
      
      setCurrentUser({
        ...currentUser,
        ...result.user
      });
      
      setAuthLoading(false);
      return result;
    } catch (err) {
      setAuthLoading(false);
      setError(err.message || 'An error occurred while updating profile. Please try again.');
      throw err;
    }
  };

  // For demo purposes - bypass authentication
  const setBypassAuth = (userData) => {
    console.warn('Demo mode is not supported with Supabase authentication');
    
    // Instead of using a fake token, we can redirect to login
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        authLoading,
        error,
        register,
        login,
        logout,
        updateProfile,
        setBypassAuth,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;