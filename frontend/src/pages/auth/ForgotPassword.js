import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call resetPassword function from auth context
      const result = await resetPassword(email);
      
      if (result.success) {
        setSubmitted(true);
        toast.success('Password reset instructions have been sent to your email');
      } else {
        toast.error(result.error || 'Failed to send reset instructions. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span style={{ fontSize: '2rem' }}>🐾</span>
          <h2>VenueHub</h2>
        </div>
        
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">
          {submitted ? 
            'Check your email for reset instructions' : 
            'Enter your email to reset your password'}
        </p>
        
        {!submitted ? (
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
            
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        ) : (
          <div className="text-center mt-4">
            <p>We've sent password reset instructions to <strong>{email}</strong></p>
            <p className="mt-2">Please check your email and follow the instructions to reset your password.</p>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => setSubmitted(false)}
              style={{ width: '100%' }}
            >
              Try another email
            </button>
          </div>
        )}
        
        <div className="auth-footer">
          Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;