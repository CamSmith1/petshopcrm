import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>PawConnect NZ</h3>
            <p>
              Connecting Kiwi pet owners with top-quality service providers for all your dog care needs throughout New Zealand.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Sign Up</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Services</h3>
            <ul>
              <li>
                <Link to="/services?category=grooming">Dog Grooming</Link>
              </li>
              <li>
                <Link to="/services?category=boarding">Dog Boarding</Link>
              </li>
              <li>
                <Link to="/services?category=training">Dog Training</Link>
              </li>
              <li>
                <Link to="/services?category=daycare">Dog Daycare</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul className="contact-info">
              <li>
                <i className="fas fa-envelope"></i> info@pawconnectnz.co.nz
              </li>
              <li>
                <i className="fas fa-phone"></i> 0800 PAW CONNECT (729 266)
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i> 123 Lambton Quay, Wellington 6011, New Zealand
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} PawConnect NZ. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;