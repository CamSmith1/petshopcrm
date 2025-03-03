import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'pet_owner',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    // Remove confirmPassword from data sent to API
    const { confirmPassword, ...registrationData } = formData;
    
    try {
      await register(registrationData);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(error || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <h2>Create Your Account</h2>
          <p>Join our community and connect with dog service providers!</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
              <small>Password must be at least 6 characters</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <div className="form-group">
              <label>I am a:</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="pet_owner"
                    checked={formData.role === 'pet_owner'}
                    onChange={handleChange}
                  />
                  Pet Owner
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="service_provider"
                    checked={formData.role === 'service_provider'}
                    onChange={handleChange}
                  />
                  Service Provider
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="auth-redirect">
            <p>Already have an account?</p>
            <Link to="/login" className="auth-redirect-link">
              Log In
            </Link>
          </div>
          
          <div className="terms-notice">
            <p>
              By signing up, you agree to our{' '}
              <Link to="/terms-of-service">Terms of Service</Link> and{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;