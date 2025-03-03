import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext, { useAuth } from '../context/AuthContext';

const Login = ({ handleBypassLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, isAuthenticated, setBypassAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(formData);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(error || 'Login failed. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Use the passed handleBypassLogin from App component
  const onDemoAccess = () => {
    handleBypassLogin();
    toast.success('Demo access granted!');
  };
  
  return (
    <div className="auth-card">
      <div className="auth-logo">
        <span style={{ fontSize: '36px' }}>🐾</span>
      </div>
      
      <h1 className="auth-title">Dog Services Portal</h1>
      <p className="auth-subtitle">Sign in to manage your business</p>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            className="form-control"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className="form-control"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div className="remember-me">
            <input type="checkbox" id="remember" className="remember-me-checkbox" />
            <label htmlFor="remember">Remember me</label>
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '10px' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
        
        <button 
          type="button" 
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={onDemoAccess}
        >
          Quick Demo Access
        </button>
      </form>
      
      <div className="auth-divider">
        <span className="auth-divider-text">OR</span>
      </div>
      
      <div className="auth-social-buttons">
        <button className="auth-social-btn">
          <span className="auth-social-icon">G</span>
          <span>Google</span>
        </button>
        <button className="auth-social-btn">
          <span className="auth-social-icon">f</span>
          <span>Facebook</span>
        </button>
      </div>
      
      <div className="auth-footer">
        Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;