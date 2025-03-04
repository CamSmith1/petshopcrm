import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, setBypassAuth } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call login function from auth context with properly trimmed data
      const credentials = {
        email: email.trim(),
        password: password,
        rememberMe
      };
      
      console.log('Login credentials:', { ...credentials, password: '****' });
      const result = await login(credentials);
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDemoAccess = () => {
    // Create a mock user for demo purposes
    const demoUser = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'business',
      businessId: 'demo-business-456'
    };
    
    setBypassAuth(demoUser);
    toast.success('Demo access granted!');
    navigate('/dashboard');
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span style={{ fontSize: '2rem' }}>📅</span>
          <h2>BookingPro</h2>
        </div>
        
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember-me"
                className="remember-me-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            
            <div className="forgot-password">
              <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span className="auth-divider-text">Or</span>
        </div>
        
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '10px', backgroundColor: '#4CAF50' }}
          onClick={handleDemoAccess}
        >
          Try Demo Access
        </button>
        
        <div className="auth-divider">
          <span className="auth-divider-text">Or sign in with</span>
        </div>
        
        <div className="auth-social-buttons">
          <button className="auth-social-btn">
            <span className="auth-social-icon">G</span>
            Google
          </button>
          <button className="auth-social-btn">
            <span className="auth-social-icon">f</span>
            Facebook
          </button>
        </div>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;