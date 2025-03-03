import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Find Premium Dog Services Across New Zealand</h1>
            <p>Connect with trusted Kiwi service providers for grooming, boarding, training, and more for your furry whānau members.</p>
            <div className="hero-buttons">
              <Link to="/services" className="btn btn-primary">Find Services</Link>
              <Link to="/register" className="btn btn-secondary">Become a Provider</Link>
              <button 
                onClick={() => {
                  navigate('/login');
                  // Add a delay to trigger the demo login after page loads
                  setTimeout(() => {
                    document.querySelector('.btn-secondary')?.click();
                  }, 500);
                }} 
                className="btn btn-outline-primary"
              >
                Demo Access
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">How PawConnect Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Discover Local Services</h3>
              <p>Find quality dog services anywhere in New Zealand, from Auckland to Queenstown.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Book with Confidence</h3>
              <p>Schedule appointments with real-time availability and secure booking confirmation.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Pay with Ease</h3>
              <p>Secure online payments with support for all major NZ payment methods.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Share Your Experience</h3>
              <p>Leave reviews to help other Kiwi dog owners find quality care.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="services-preview">
        <div className="container">
          <h2 className="section-title">Popular Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-image">🐕</div>
              <h3>Dog Grooming</h3>
              <p>Professional grooming services for all breeds, from Huntaways to Samoyeds.</p>
              <Link to="/services?category=grooming" className="btn btn-sm">View Services</Link>
            </div>
            <div className="service-card">
              <div className="service-image">🏠</div>
              <h3>Dog Boarding</h3>
              <p>Safe and comfortable boarding while you're away on holiday or business.</p>
              <Link to="/services?category=boarding" className="btn btn-sm">View Services</Link>
            </div>
            <div className="service-card">
              <div className="service-image">🚶‍♂️</div>
              <h3>Dog Walking</h3>
              <p>Regular walks around your local parks and beaches to keep your dog happy and healthy.</p>
              <Link to="/services?category=walking" className="btn btn-sm">View Services</Link>
            </div>
            <div className="service-card">
              <div className="service-image">🎓</div>
              <h3>Dog Training</h3>
              <p>Expert training from certified NZ dog trainers for dogs of all ages and breeds.</p>
              <Link to="/services?category=training" className="btn btn-sm">View Services</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose PawConnect NZ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🇳🇿</div>
              <h3>Locally Owned</h3>
              <p>Proudly Kiwi-owned and operated, supporting local businesses across New Zealand.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Verified Providers</h3>
              <p>All our service providers undergo thorough verification for your peace of mind.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💯</div>
              <h3>Satisfaction Guarantee</h3>
              <p>We stand behind the quality of services offered on our platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🐾</div>
              <h3>Dog-First Approach</h3>
              <p>Created by dog lovers, for dog lovers — your pet's wellbeing is our priority.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;