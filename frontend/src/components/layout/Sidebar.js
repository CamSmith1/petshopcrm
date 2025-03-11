import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ collapsed, userRole = 'business' }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const [expandedMenus, setExpandedMenus] = useState({
    dashboard: false,
    scheduling: false,
    appointments: false,
    customers: false,
    services: false,
    integrations: false,
    settings: false,
    admin: false
  });
  
  const toggleMenuExpand = (menu) => {
    setExpandedMenus({
      ...expandedMenus,
      [menu]: !expandedMenus[menu]
    });
  };
  
  const isActiveRoute = (route) => {
    if (route === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    
    return location.pathname === route || location.pathname.startsWith(`${route}/`);
  };
  
  const isMenuActive = (routes) => {
    return routes.some(route => location.pathname.startsWith(route));
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
  
  // Menu item component for reuse
  const MenuItem = ({ to, icon, text, active, onClick, submenu = false }) => (
    <Link 
      to={to} 
      className={`menu-item ${active ? 'active' : ''} ${submenu ? 'submenu-item' : ''}`}
      onClick={onClick}
    >
      {!submenu && icon && <span className="menu-icon">{icon}</span>}
      <span className="menu-text">{text}</span>
    </Link>
  );
  
  // Menu toggle component for expandable sections
  const MenuToggle = ({ title, icon, expanded, onToggle, active }) => (
    <div 
      className={`menu-toggle ${active ? 'active' : ''} ${expanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      <div className="menu-toggle-content">
        <span className="menu-icon">{icon}</span>
        <span className="menu-text">{title}</span>
      </div>
      <span className="toggle-icon">{expanded ? '▼' : '▶'}</span>
    </div>
  );

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📅</span>
          <span className="logo-text">BookingPro</span>
        </div>
      </div>
      
      <div className="sidebar-menu">
        {/* Dashboard Section */}
        {userRole === 'admin' ? (
          <MenuItem 
            to="/admin/dashboard" 
            icon="⚡" 
            text="Admin Dashboard" 
            active={isMenuActive(['/admin'])}
          />
        ) : (
          <MenuItem 
            to="/dashboard" 
            icon="📊" 
            text="Dashboard" 
            active={isActiveRoute('/dashboard')}
          />
        )}
        
        {/* Calendar Section */}
        <MenuItem 
          to="/calendar" 
          icon="📅" 
          text="Calendar" 
          active={isActiveRoute('/calendar')}
        />
        
        {/* Appointments Section */}
        <MenuItem 
          to="/appointments" 
          icon="📝" 
          text="Appointments" 
          active={isMenuActive(['/appointments'])}
        />
        
        {/* Customers Section */}
        <MenuItem 
          to="/customers" 
          icon="👥" 
          text="Customers" 
          active={isMenuActive(['/customers'])}
        />
        
        {/* Services Section */}
        <MenuItem 
          to="/services" 
          icon="🛠️" 
          text="Services" 
          active={isMenuActive(['/services'])}
        />
        
        {/* Booking Page Section */}
        <MenuItem 
          to="/booking-page-setup" 
          icon="🔗" 
          text="Booking Page" 
          active={isMenuActive(['/booking-page-setup'])}
        />
        
        {/* Settings Section */}
        <MenuToggle
          title="Settings"
          icon="⚙️"
          expanded={expandedMenus.settings}
          onToggle={() => toggleMenuExpand('settings')}
          active={isMenuActive(['/settings', '/profile', '/business-profile', '/staff', '/locations', '/notifications'])}
        />
        
        {expandedMenus.settings && (
          <div className="submenu">
            <MenuItem 
              to="/profile" 
              text="Your Profile" 
              active={isActiveRoute('/profile')}
              submenu
            />
            <MenuItem 
              to="/business-profile" 
              text="Business Profile" 
              active={isActiveRoute('/business-profile')}
              submenu
            />
            <MenuItem 
              to="/staff" 
              text="Staff Management" 
              active={isActiveRoute('/staff')}
              submenu
            />
            <MenuItem 
              to="/locations" 
              text="Locations" 
              active={isActiveRoute('/locations')}
              submenu
            />
            <MenuItem 
              to="/notifications" 
              text="Notifications" 
              active={isActiveRoute('/notifications')}
              submenu
            />
            <MenuItem 
              to="/settings" 
              text="General Settings" 
              active={isActiveRoute('/settings')}
              submenu
            />
          </div>
        )}
        
        {/* Logout button */}
        <div 
          className="menu-item logout-item"
          onClick={logout}
          style={{ cursor: 'pointer', marginTop: 'auto' }}
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