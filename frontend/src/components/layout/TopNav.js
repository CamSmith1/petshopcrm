import React from 'react';
import { useLocation } from 'react-router-dom';

const TopNav = ({ toggleSidebar }) => {
  const location = useLocation();
  
  // Generate page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/calendar') return 'Schedule Calendar';
    if (path === '/appointments') return 'Appointments';
    if (path.includes('/appointments/')) return 'Appointment Details';
    if (path === '/customers') return 'Customers';
    if (path.includes('/customers/')) return 'Customer Details';
    if (path === '/pets') return 'Pets';
    if (path === '/services') return 'Services';
    if (path.includes('/services/')) return 'Service Details';
    if (path === '/widget-integration') return 'Widget Integration';
    if (path === '/settings') return 'Settings';
    if (path === '/profile') return 'Your Profile';
    
    return 'Dog Services Portal';
  };
  
  // Get current date in a readable format
  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="top-nav">
      <div className="top-nav-left">
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="top-nav-title">{getPageTitle()}</div>
      </div>
      
      <div className="top-nav-actions">
        <div style={{ color: 'var(--medium-text)', marginRight: '15px' }}>
          {getCurrentDate()}
        </div>
        
        <button className="nav-action">
          <span>🔍</span>
        </button>
        
        <button className="nav-action">
          <span>🔔</span>
          <span className="action-badge">3</span>
        </button>
        
        <button className="nav-action">
          <span>⚙️</span>
        </button>
      </div>
    </div>
  );
};

export default TopNav;