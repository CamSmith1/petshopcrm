import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Dashboard, CalendarMonth, ListAlt, People, 
  Business, Link as LinkIcon, ExpandMore, ExpandLess,
  Person, Settings, GroupWork, LocationOn, Notifications, 
  Security, Logout, Close, Home, Description, 
  Engineering, PowerSettingsNew, LightMode, DarkMode,
  MeetingRoom, Category
} from '@mui/icons-material';

/**
 * Mobile Menu component that appears on small screens
 * Provides a mobile-friendly navigation experience
 */
const MobileMenu = ({ isOpen, onClose, userRole = 'business' }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
  
  const handleLogout = () => {
    onClose();
    logout();
  };
  
  // Menu toggle component for expandable sections
  const MenuToggle = ({ title, icon, expanded, onToggle, active }) => (
    <div 
      className={`mobile-menu-toggle ${active ? 'active' : ''} ${expanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      <div className="mobile-menu-toggle-content">
        <span className="mobile-menu-icon">{icon}</span>
        <span className="mobile-menu-text">{title}</span>
      </div>
      <span className="mobile-toggle-icon">{expanded ? <ExpandMore /> : <ExpandLess />}</span>
    </div>
  );
  
  // Menu item component for reuse
  const MenuItem = ({ to, icon, text, active, onClick, submenu = false }) => (
    <Link 
      to={to} 
      className={`mobile-menu-item ${active ? 'active' : ''} ${submenu ? 'mobile-submenu-item' : ''}`}
      onClick={() => {
        if (onClick) onClick();
        onClose();
      }}
    >
      <span className="mobile-menu-icon">{icon}</span>
      <span className="mobile-menu-text">{text}</span>
    </Link>
  );

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={onClose}
        ></div>
      )}
      
      {/* Mobile menu drawer */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''} ${theme === 'dark' ? 'dark-theme' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <span className="mobile-logo-icon"><CalendarMonth /></span>
            <span className="mobile-logo-text">VenueHub</span>
          </div>
          <button className="mobile-close-btn" onClick={onClose}><Close /></button>
        </div>
        
        <div className="mobile-user-info">
          <div className="mobile-user-avatar">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="mobile-user-details">
            <div className="mobile-user-name">{currentUser?.name || 'User'}</div>
            <div className="mobile-user-email">{currentUser?.email || 'user@example.com'}</div>
          </div>
        </div>
        
        <div className="mobile-menu-content">
          {/* Dashboard Section */}
          {userRole === 'admin' ? (
            <>
              <MenuToggle
                title="Admin Dashboard"
                icon={<Dashboard />}
                expanded={expandedMenus.admin}
                onToggle={() => toggleMenuExpand('admin')}
                active={isMenuActive(['/admin'])}
              />
              
              {expandedMenus.admin && (
                <div className="mobile-submenu">
                  <MenuItem 
                    to="/admin/dashboard" 
                    icon={<Dashboard />} 
                    text="Overview" 
                    active={isActiveRoute('/admin/dashboard')}
                    submenu
                  />
                  <MenuItem 
                    to="/admin/businesses" 
                    icon={<Business />} 
                    text="Businesses" 
                    active={isActiveRoute('/admin/businesses')}
                    submenu
                  />
                  <MenuItem 
                    to="/admin/subscriptions" 
                    icon={<PowerSettingsNew />} 
                    text="Subscriptions" 
                    active={isActiveRoute('/admin/subscriptions')}
                    submenu
                  />
                  <MenuItem 
                    to="/admin/white-label" 
                    icon={<Category />} 
                    text="White Label" 
                    active={isActiveRoute('/admin/white-label')}
                    submenu
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <MenuToggle
                title="Dashboard"
                icon={<Dashboard />}
                expanded={expandedMenus.dashboard}
                onToggle={() => toggleMenuExpand('dashboard')}
                active={isMenuActive(['/dashboard'])}
              />
              
              {expandedMenus.dashboard && (
                <div className="mobile-submenu">
                  <MenuItem 
                    to="/dashboard" 
                    icon={<Home />} 
                    text="Overview" 
                    active={isActiveRoute('/dashboard')}
                    submenu
                  />
                </div>
              )}
            </>
          )}
          
          {/* Calendar/Scheduling Section */}
          <MenuItem 
            to="/calendar" 
            icon={<CalendarMonth />} 
            text="Calendar" 
            active={isActiveRoute('/calendar')}
          />
          
          {/* Appointments Section */}
          <MenuToggle
            title="Appointments"
            icon={<ListAlt />}
            expanded={expandedMenus.appointments}
            onToggle={() => toggleMenuExpand('appointments')}
            active={isMenuActive(['/appointments'])}
          />
          
          {expandedMenus.appointments && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/appointments" 
                icon={<Description />} 
                text="All Appointments" 
                active={location.pathname === '/appointments'}
                submenu
              />
            </div>
          )}
          
          {/* Customers Section */}
          <MenuItem 
            to="/customers" 
            icon={<People />} 
            text="Customers" 
            active={isMenuActive(['/customers'])}
          />
          
          {/* Services Section */}
          <MenuToggle
            title="Services"
            icon={<Engineering />}
            expanded={expandedMenus.services}
            onToggle={() => toggleMenuExpand('services')}
            active={isMenuActive(['/services', '/service-templates'])}
          />
          
          {expandedMenus.services && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/services" 
                icon={<Description />} 
                text="All Services" 
                active={location.pathname === '/services'}
                submenu
              />
              <MenuItem 
                to="/service-templates" 
                icon={<Description />} 
                text="Services" 
                active={isActiveRoute('/service-templates')}
                submenu
              />
            </div>
          )}
          
          {/* Integration Section */}
          <MenuToggle
            title="Integrations"
            icon={<LinkIcon />}
            expanded={expandedMenus.integrations}
            onToggle={() => toggleMenuExpand('integrations')}
            active={isMenuActive(['/booking-page-setup'])}
          />
          
          {expandedMenus.integrations && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/booking-page-setup" 
                icon={<CalendarMonth />} 
                text="Booking Page" 
                active={isActiveRoute('/booking-page-setup')}
                submenu
              />
            </div>
          )}
          
          {/* Settings Section */}
          <MenuToggle
            title="Settings"
            icon={<Settings />}
            expanded={expandedMenus.settings}
            onToggle={() => toggleMenuExpand('settings')}
            active={isMenuActive(['/settings', '/profile', '/business-profile', '/staff', '/locations', '/notifications'])}
          />
          
          {expandedMenus.settings && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/profile" 
                icon={<Person />} 
                text="Your Profile" 
                active={isActiveRoute('/profile')}
                submenu
              />
              <MenuItem 
                to="/business-profile" 
                icon={<Business />} 
                text="Business Profile" 
                active={isActiveRoute('/business-profile')}
                submenu
              />
              <MenuItem 
                to="/staff" 
                icon={<GroupWork />} 
                text="Staff Management" 
                active={isActiveRoute('/staff')}
                submenu
              />
              <MenuItem 
                to="/locations" 
                icon={<LocationOn />} 
                text="Locations" 
                active={isActiveRoute('/locations')}
                submenu
              />
              <MenuItem 
                to="/notifications" 
                icon={<Notifications />} 
                text="Notifications" 
                active={isActiveRoute('/notifications')}
                submenu
              />
              <MenuItem 
                to="/settings" 
                icon={<Settings />} 
                text="General Settings" 
                active={isActiveRoute('/settings')}
                submenu
              />
            </div>
          )}
        </div>
        
        <div className="mobile-menu-footer">
          <div 
            className="theme-toggle"
            onClick={toggleTheme}
          >
            <span className="theme-icon">{theme === 'dark' ? <LightMode /> : <DarkMode />}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          
          <div 
            className="mobile-logout-btn"
            onClick={handleLogout}
          >
            <span className="mobile-logout-icon"><Logout /></span>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;