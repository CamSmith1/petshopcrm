import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/MockAuthContext';

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  const isActiveRoute = (route) => {
    return location.pathname === route;
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.name) return 'U';
    
    const nameParts = currentUser.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return nameParts[0][0].toUpperCase();
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🐾</span>
          <span className="logo-text">DogServices</span>
        </div>
      </div>
      
      <div className="sidebar-menu">
        <Link 
          to="/dashboard" 
          className={`menu-item ${isActiveRoute('/dashboard') ? 'active' : ''}`}
        >
          <span className="menu-icon">📊</span>
          <span className="menu-text">Dashboard</span>
        </Link>
        
        <Link 
          to="/calendar" 
          className={`menu-item ${isActiveRoute('/calendar') ? 'active' : ''}`}
        >
          <span className="menu-icon">📅</span>
          <span className="menu-text">Schedule</span>
        </Link>
        
        <Link 
          to="/appointments" 
          className={`menu-item ${isActiveRoute('/appointments') ? 'active' : ''}`}
        >
          <span className="menu-icon">📝</span>
          <span className="menu-text">Appointments</span>
        </Link>
        
        <div className="menu-section">Customers</div>
        
        <Link 
          to="/customers" 
          className={`menu-item ${isActiveRoute('/customers') ? 'active' : ''}`}
        >
          <span className="menu-icon">👥</span>
          <span className="menu-text">Customers</span>
        </Link>
        
        <Link 
          to="/pets" 
          className={`menu-item ${isActiveRoute('/pets') ? 'active' : ''}`}
        >
          <span className="menu-icon">🐕</span>
          <span className="menu-text">Pets</span>
        </Link>
        
        <div className="menu-section">Business</div>
        
        <Link 
          to="/services" 
          className={`menu-item ${isActiveRoute('/services') ? 'active' : ''}`}
        >
          <span className="menu-icon">🛠️</span>
          <span className="menu-text">Services</span>
        </Link>
        
        <Link 
          to="/widget-integration" 
          className={`menu-item ${isActiveRoute('/widget-integration') ? 'active' : ''}`}
        >
          <span className="menu-icon">🔌</span>
          <span className="menu-text">Widget Integration</span>
        </Link>
        
        <div className="menu-section">Account</div>
        
        <Link 
          to="/settings" 
          className={`menu-item ${isActiveRoute('/settings') ? 'active' : ''}`}
        >
          <span className="menu-icon">⚙️</span>
          <span className="menu-text">Settings</span>
        </Link>
        
        <div 
          className="menu-item"
          onClick={logout}
          style={{ cursor: 'pointer' }}
        >
          <span className="menu-icon">🚪</span>
          <span className="menu-text">Logout</span>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          <div className="user-details">
            <div style={{ fontWeight: '500' }}>{currentUser?.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--medium-text)' }}>
              {currentUser?.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;