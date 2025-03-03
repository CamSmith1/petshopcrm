import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'}!</p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Upcoming Bookings</h3>
            <p className="stat-number">3</p>
            <Link to="/bookings" className="btn btn-sm">View All</Link>
          </div>
          {user?.role === 'pet_owner' && (
            <div className="stat-card">
              <h3>My Pets</h3>
              <p className="stat-number">2</p>
              <Link to="/manage-pets" className="btn btn-sm">Manage</Link>
            </div>
          )}
          {user?.role === 'service_provider' && (
            <div className="stat-card">
              <h3>My Services</h3>
              <p className="stat-number">5</p>
              <Link to="/manage-services" className="btn btn-sm">Manage</Link>
            </div>
          )}
          {user?.role === 'service_provider' && (
            <div className="stat-card">
              <h3>Pending Requests</h3>
              <p className="stat-number">2</p>
              <Link to="/bookings?status=pending" className="btn btn-sm">View</Link>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {user?.role === 'pet_owner' && (
              <>
                <Link to="/services" className="action-card">
                  <div className="action-icon">🔍</div>
                  <h3>Find Services</h3>
                </Link>
                <Link to="/manage-pets" className="action-card">
                  <div className="action-icon">🐕</div>
                  <h3>Manage Pets</h3>
                </Link>
              </>
            )}
            {user?.role === 'service_provider' && (
              <>
                <Link to="/manage-services" className="action-card">
                  <div className="action-icon">📝</div>
                  <h3>Manage Services</h3>
                </Link>
                <Link to="/manage-services/create" className="action-card">
                  <div className="action-icon">➕</div>
                  <h3>Add New Service</h3>
                </Link>
              </>
            )}
            <Link to="/bookings" className="action-card">
              <div className="action-icon">📅</div>
              <h3>View Bookings</h3>
            </Link>
            <Link to="/profile" className="action-card">
              <div className="action-icon">👤</div>
              <h3>Edit Profile</h3>
            </Link>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <h4>Booking Confirmed</h4>
                <p>Your booking for Dog Grooming has been confirmed.</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💬</div>
              <div className="activity-content">
                <h4>New Message</h4>
                <p>You have a new message from John regarding your booking.</p>
                <p className="activity-time">Yesterday</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">⭐</div>
              <div className="activity-content">
                <h4>New Review</h4>
                <p>You received a 5-star review for Dog Training service.</p>
                <p className="activity-time">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;