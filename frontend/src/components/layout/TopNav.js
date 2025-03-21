import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Notifications, Settings } from '@mui/icons-material';

const TopNav = ({ toggleSidebar }) => {
  const location = useLocation();
  
  // Generate page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/calendar') return 'Schedule Calendar';
    if (path === '/appointments') return 'Appointments';
    if (path.includes('/appointments/')) return 'Appointment Details';
    if (path === '/bookings') return 'Bookings';
    if (path.includes('/bookings/')) return 'Booking Details';
    if (path === '/customers') return 'Customers';
    if (path.includes('/customers/')) return 'Customer Details';
    if (path === '/pets') return 'Pets';
    if (path === '/services') return 'Services';
    if (path.includes('/services/')) return 'Service Details';
    if (path === '/api-access') return 'API Access';
    if (path === '/settings') return 'Settings';
    if (path === '/profile') return 'Your Profile';
    
    return 'Services';
  };
  
  // Get current date in a readable format
  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="top-nav">
      <div className="top-nav-left">
        <div className="top-nav-title">{getPageTitle()}</div>
      </div>
      
      <div className="top-nav-actions">
        <div style={{ color: 'var(--medium-text)', marginRight: '15px' }}>
          {getCurrentDate()}
        </div>
        
        <button className="nav-action">
          <Search />
        </button>
        
        <button className="nav-action">
          <Notifications />
          <span className="action-badge">3</span>
        </button>
        
        <button className="nav-action">
          <Settings />
        </button>
      </div>
    </div>
  );
};

export default TopNav;