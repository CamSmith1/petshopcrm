import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>Booking<span>Pro</span></h1>
            </Link>
          </div>
          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/bookings">My Bookings</Link>
                  </li>
                  {user?.role === 'pet_owner' && (
                    <li>
                      <Link to="/manage-pets">My Pets</Link>
                    </li>
                  )}
                  {user?.role === 'service_provider' && (
                    <li>
                      <Link to="/manage-services">My Services</Link>
                    </li>
                  )}
                  <li className="dropdown">
                    <button className="dropdown-toggle">
                      {user?.name || 'Account'}
                    </button>
                    <div className="dropdown-menu">
                      <Link to="/profile" className="dropdown-item">
                        Profile
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item">
                        Logout
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                  <li>
                    <Link to="/register" className="btn btn-primary">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;