import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
      <span className="mobile-toggle-icon">{expanded ? '▼' : '▶'}</span>
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
            <span className="mobile-logo-icon">📅</span>
            <span className="mobile-logo-text">BookingPro</span>
          </div>
          <button className="mobile-close-btn" onClick={onClose}>✕</button>
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
                icon="⚡"
                expanded={expandedMenus.admin}
                onToggle={() => toggleMenuExpand('admin')}
                active={isMenuActive(['/admin'])}
              />
              
              {expandedMenus.admin && (
                <div className="mobile-submenu">
                  <MenuItem 
                    to="/admin/dashboard" 
                    icon="📊" 
                    text="Overview" 
                    active={isActiveRoute('/admin/dashboard')}
                    submenu
                  />
                  <MenuItem 
                    to="/admin/businesses" 
                    icon="🏢" 
                    text="Businesses" 
                    active={isActiveRoute('/admin/businesses')}
                    submenu
                  />
                  <MenuItem 
                    to="/admin/subscriptions" 
                    icon="💰" 
                    text="Subscriptions" 
                    active={isActiveRoute('/admin/subscriptions')}
                    submenu
                  />
                  <MenuItem 
                    to="/admin/white-label" 
                    icon="🏷️" 
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
                icon="📊"
                expanded={expandedMenus.dashboard}
                onToggle={() => toggleMenuExpand('dashboard')}
                active={isMenuActive(['/dashboard', '/analytics', '/revenue'])}
              />
              
              {expandedMenus.dashboard && (
                <div className="mobile-submenu">
                  <MenuItem 
                    to="/dashboard" 
                    icon="🏠" 
                    text="Overview" 
                    active={isActiveRoute('/dashboard')}
                    submenu
                  />
                  <MenuItem 
                    to="/analytics" 
                    icon="📈" 
                    text="Analytics" 
                    active={isActiveRoute('/analytics')}
                    submenu
                  />
                  <MenuItem 
                    to="/revenue" 
                    icon="💰" 
                    text="Revenue" 
                    active={isActiveRoute('/revenue')}
                    submenu
                  />
                </div>
              )}
            </>
          )}
          
          {/* Calendar/Scheduling Section */}
          <MenuToggle
            title="Scheduling"
            icon="📅"
            expanded={expandedMenus.scheduling}
            onToggle={() => toggleMenuExpand('scheduling')}
            active={isMenuActive(['/calendar', '/staff-scheduling', '/holidays'])}
          />
          
          {expandedMenus.scheduling && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/calendar" 
                icon="📆" 
                text="Calendar" 
                active={isActiveRoute('/calendar')}
                submenu
              />
              <MenuItem 
                to="/staff-scheduling" 
                icon="👥" 
                text="Staff Scheduling" 
                active={isActiveRoute('/staff-scheduling')}
                submenu
              />
              <MenuItem 
                to="/holidays" 
                icon="🎉" 
                text="Holidays & Closures" 
                active={isActiveRoute('/holidays')}
                submenu
              />
            </div>
          )}
          
          {/* Appointments Section */}
          <MenuToggle
            title="Appointments"
            icon="📝"
            expanded={expandedMenus.appointments}
            onToggle={() => toggleMenuExpand('appointments')}
            active={isMenuActive(['/appointments', '/recurring-appointments'])}
          />
          
          {expandedMenus.appointments && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/appointments" 
                icon="📋" 
                text="All Appointments" 
                active={location.pathname === '/appointments'}
                submenu
              />
              <MenuItem 
                to="/appointments?status=upcoming" 
                icon="⏳" 
                text="Upcoming" 
                active={location.pathname === '/appointments' && location.search.includes('status=upcoming')}
                submenu
              />
              <MenuItem 
                to="/recurring-appointments" 
                icon="🔄" 
                text="Recurring" 
                active={isActiveRoute('/recurring-appointments')}
                submenu
              />
            </div>
          )}
          
          {/* Customers Section */}
          <MenuToggle
            title="Customers"
            icon="👥"
            expanded={expandedMenus.customers}
            onToggle={() => toggleMenuExpand('customers')}
            active={isMenuActive(['/customers', '/pets'])}
          />
          
          {expandedMenus.customers && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/customers" 
                icon="👤" 
                text="Customers" 
                active={location.pathname === '/customers'}
                submenu
              />
              <MenuItem 
                to="/pets" 
                icon="🐕" 
                text="Pets" 
                active={location.pathname === '/pets'}
                submenu
              />
            </div>
          )}
          
          {/* Services Section */}
          <MenuToggle
            title="Services"
            icon="🛠️"
            expanded={expandedMenus.services}
            onToggle={() => toggleMenuExpand('services')}
            active={isMenuActive(['/services', '/service-categories', '/service-templates', '/custom-fields'])}
          />
          
          {expandedMenus.services && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/services" 
                icon="📋" 
                text="All Services" 
                active={location.pathname === '/services'}
                submenu
              />
              <MenuItem 
                to="/service-categories" 
                icon="🗂️" 
                text="Categories" 
                active={isActiveRoute('/service-categories')}
                submenu
              />
              <MenuItem 
                to="/service-templates" 
                icon="📑" 
                text="Templates" 
                active={isActiveRoute('/service-templates')}
                submenu
              />
              <MenuItem 
                to="/custom-fields" 
                icon="✏️" 
                text="Custom Fields" 
                active={isActiveRoute('/custom-fields')}
                submenu
              />
            </div>
          )}
          
          {/* Integration Section */}
          <MenuToggle
            title="Integrations"
            icon="🔌"
            expanded={expandedMenus.integrations}
            onToggle={() => toggleMenuExpand('integrations')}
            active={isMenuActive(['/widget-integration', '/widget-preview', '/api-access', '/webhooks'])}
          />
          
          {expandedMenus.integrations && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/widget-integration" 
                icon="🧩" 
                text="Widget" 
                active={isActiveRoute('/widget-integration')}
                submenu
              />
              <MenuItem 
                to="/widget-preview" 
                icon="👁️" 
                text="Preview" 
                active={isActiveRoute('/widget-preview')}
                submenu
              />
              <MenuItem 
                to="/api-access" 
                icon="🔑" 
                text="API Access" 
                active={isActiveRoute('/api-access')}
                submenu
              />
              <MenuItem 
                to="/webhooks" 
                icon="🪝" 
                text="Webhooks" 
                active={isActiveRoute('/webhooks')}
                submenu
              />
            </div>
          )}
          
          {/* Settings Section */}
          <MenuToggle
            title="Settings"
            icon="⚙️"
            expanded={expandedMenus.settings}
            onToggle={() => toggleMenuExpand('settings')}
            active={isMenuActive(['/settings', '/profile', '/business-profile', '/staff', '/locations', '/notifications'])}
          />
          
          {expandedMenus.settings && (
            <div className="mobile-submenu">
              <MenuItem 
                to="/profile" 
                icon="👤" 
                text="Your Profile" 
                active={isActiveRoute('/profile')}
                submenu
              />
              <MenuItem 
                to="/business-profile" 
                icon="🏢" 
                text="Business Profile" 
                active={isActiveRoute('/business-profile')}
                submenu
              />
              <MenuItem 
                to="/staff" 
                icon="👥" 
                text="Staff Management" 
                active={isActiveRoute('/staff')}
                submenu
              />
              <MenuItem 
                to="/locations" 
                icon="📍" 
                text="Locations" 
                active={isActiveRoute('/locations')}
                submenu
              />
              <MenuItem 
                to="/notifications" 
                icon="🔔" 
                text="Notifications" 
                active={isActiveRoute('/notifications')}
                submenu
              />
              <MenuItem 
                to="/settings" 
                icon="⚙️" 
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
            <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          
          <div 
            className="mobile-logout-btn"
            onClick={handleLogout}
          >
            <span className="mobile-logout-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;