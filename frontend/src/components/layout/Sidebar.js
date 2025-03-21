import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Dashboard, CalendarMonth, ListAlt, People, 
  Business, Link as LinkIcon, ExpandMore, ExpandLess,
  Person, Settings, GroupWork, LocationOn, Notifications, 
  AccountCircle, Security, Logout, KeyboardArrowUp, KeyboardArrowDown
} from '@mui/icons-material';

const Sidebar = ({ collapsed, userRole = 'business' }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { theme } = useTheme();
  const [expandedMenus, setExpandedMenus] = useState({
    dashboard: false,
    scheduling: false,
    appointments: false,
    customers: false,
    venues: false,
    integrations: false,
    admin: false
  });
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const toggleMenuExpand = (menu) => {
    setExpandedMenus({
      ...expandedMenus,
      [menu]: !expandedMenus[menu]
    });
  };
  
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
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
  
  // Check if we're in dev/demo mode
  const isDemoMode = () => {
    return process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (isDemoMode() && (!currentUser || !currentUser.name)) return 'DS';
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
      <span className="toggle-icon">{expanded ? <ExpandMore /> : <ExpandLess />}</span>
    </div>
  );

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon"><CalendarMonth /></span>
          <span className="logo-text">VenueHub</span>
        </div>
      </div>
      
      <div className="sidebar-menu">
        {/* Dashboard Section */}
        {userRole === 'admin' ? (
          <MenuItem 
            to="/admin/dashboard" 
            icon={<Dashboard />} 
            text="Admin Dashboard" 
            active={isMenuActive(['/admin'])}
          />
        ) : (
          <MenuItem 
            to="/dashboard" 
            icon={<Dashboard />} 
            text="Dashboard" 
            active={isActiveRoute('/dashboard')}
          />
        )}
        
        {/* Calendar Section */}
        <MenuItem 
          to="/calendar" 
          icon={<CalendarMonth />} 
          text="Calendar" 
          active={isActiveRoute('/calendar')}
        />
        
        {/* Bookings Section */}
        <MenuItem 
          to="/bookings" 
          icon={<ListAlt />} 
          text="Bookings" 
          active={isMenuActive(['/bookings'])}
        />
        
        {/* Customers Section */}
        <MenuItem 
          to="/customers" 
          icon={<People />} 
          text="Customers" 
          active={isMenuActive(['/customers'])}
        />
        
        {/* Venues Section */}
        <MenuItem 
          to="/manage-venues" 
          icon={<Business />} 
          text="Venues" 
          active={isMenuActive(['/manage-venues'])}
        />
        
        {/* Booking Page Section */}
        <MenuItem 
          to="/booking-page-setup" 
          icon={<LinkIcon />} 
          text="Booking Page" 
          active={isMenuActive(['/booking-page-setup'])}
        />
        
        {/* Settings have been moved to user profile dropdown */}
        
        {/* Logout moved to profile dropdown menu */}
      </div>
      
      <div className="sidebar-footer">
        <div className="user-info" onClick={toggleProfileMenu}>
          <div className="user-avatar">
            <AccountCircle style={{ fontSize: '1.8rem' }} />
          </div>
          <div className="user-details">
            <div style={{ fontWeight: '500' }}>
              {isDemoMode() && !currentUser?.name ? 'Demo User' : currentUser?.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--medium-text)' }}>
              {isDemoMode() && !currentUser?.email ? 'demo@example.com' : currentUser?.email}
            </div>
          </div>
          
          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="profile-dropdown">
              <Link to="/profile" className="profile-menu-item">
                <span className="profile-menu-icon"><Person /></span> Your Profile
              </Link>
              <Link to="/business-profile" className="profile-menu-item">
                <span className="profile-menu-icon"><Business /></span> Business Profile
              </Link>
              <Link to="/staff" className="profile-menu-item">
                <span className="profile-menu-icon"><GroupWork /></span> Staff Management
              </Link>
              <Link to="/locations" className="profile-menu-item">
                <span className="profile-menu-icon"><LocationOn /></span> Locations
              </Link>
              <Link to="/notifications" className="profile-menu-item">
                <span className="profile-menu-icon"><Notifications /></span> Notifications
              </Link>
              <Link to="/settings" className="profile-menu-item">
                <span className="profile-menu-icon"><Settings /></span> General Settings
              </Link>
              <Link to="/account" className="profile-menu-item">
                <span className="profile-menu-icon"><Security /></span> Manage Account
              </Link>
              <div className="profile-menu-divider"></div>
              <div className="profile-menu-item logout-menu-item" onClick={logout}>
                <span className="profile-menu-icon logout-icon"><Logout /></span> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;