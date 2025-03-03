import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

/**
 * Footer component - more minimalist design for dashboard
 */
const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-logo">
          <span>📅</span> BookingPro
        </div>
        
        <div className="footer-links">
          <Link to="/help">Help</Link>
          <Link to="/api-access">API</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
        
        <div className="footer-copyright">
          &copy; {currentYear} BookingPro. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;