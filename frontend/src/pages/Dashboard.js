import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { 
  Search, Pets, Edit, Add, EventNote, Person,
  CheckCircle, Message, Star, CalendarToday, Visibility
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Fetch upcoming bookings
        const response = await api.getBookings({
          startDate: new Date().toISOString(),
          status: ['pending', 'confirmed'],
          limit: 5
        });
        
        const bookings = response.data.bookings || [];
        setUpcomingBookings(bookings.map(booking => ({
          id: booking._id,
          customerName: booking.client?.name || 'Unknown',
          customerEmail: booking.client?.email || 'No email',
          venue: booking.location || 'Main Venue',
          date: booking.startTime,
          status: booking.status
        })));
        
        // Set total bookings count
        setTotalBookings(bookings.length);
        
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'}!</p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-number">{totalBookings}</p>
            <Link to="/bookings" className="btn btn-sm"><Visibility style={{ fontSize: '0.875rem', marginRight: '4px' }} /> View All</Link>
          </div>
          {user?.role === 'pet_owner' && (
            <div className="stat-card">
              <h3>My Pets</h3>
              <p className="stat-number">2</p>
              <Link to="/manage-pets" className="btn btn-sm"><Edit style={{ fontSize: '0.875rem', marginRight: '4px' }} /> Manage</Link>
            </div>
          )}
          {user?.role === 'service_provider' && (
            <div className="stat-card">
              <h3>My Services</h3>
              <p className="stat-number">5</p>
              <Link to="/manage-services" className="btn btn-sm"><Edit style={{ fontSize: '0.875rem', marginRight: '4px' }} /> Manage</Link>
            </div>
          )}
          {user?.role === 'service_provider' && (
            <div className="stat-card">
              <h3>Pending Requests</h3>
              <p className="stat-number">2</p>
              <Link to="/bookings?status=pending" className="btn btn-sm"><Visibility style={{ fontSize: '0.875rem', marginRight: '4px' }} /> View</Link>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {user?.role === 'pet_owner' && (
              <>
                <Link to="/services" className="action-card">
                  <div className="action-icon"><Search /></div>
                  <h3>Find Services</h3>
                </Link>
                <Link to="/manage-pets" className="action-card">
                  <div className="action-icon"><Pets /></div>
                  <h3>Manage Pets</h3>
                </Link>
              </>
            )}
            {user?.role === 'service_provider' && (
              <>
                <Link to="/manage-services" className="action-card">
                  <div className="action-icon"><Edit /></div>
                  <h3>Manage Services</h3>
                </Link>
                <Link to="/manage-services/create" className="action-card">
                  <div className="action-icon"><Add /></div>
                  <h3>Add New Service</h3>
                </Link>
              </>
            )}
            <Link to="/bookings" className="action-card">
              <div className="action-icon"><EventNote /></div>
              <h3>View Bookings</h3>
            </Link>
            <Link to="/profile" className="action-card">
              <div className="action-icon"><Person /></div>
              <h3>Edit Profile</h3>
            </Link>
          </div>
        </div>

        <div className="bookings-table-container">
          <h2>Upcoming Bookings</h2>
          {upcomingBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><CalendarToday style={{ fontSize: '3rem' }} /></div>
              <p>No upcoming bookings.</p>
              <Link to="/bookings/new" className="btn btn-primary">
                <Add style={{ marginRight: '4px' }} /> Create Booking
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>Email Address</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{formatDate(booking.date)}</td>
                      <td>{booking.customerName}</td>
                      <td>{booking.customerEmail}</td>
                      <td>{booking.venue}</td>
                      <td>
                        <span className={`status-badge badge-${booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'secondary'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/bookings/${booking.id}`} className="btn btn-sm btn-outline-primary">
                          <Visibility style={{ fontSize: '1rem', marginRight: '4px' }} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon"><CheckCircle /></div>
              <div className="activity-content">
                <h4>Booking Confirmed</h4>
                <p>Your booking for venue "Conference Room A" has been confirmed.</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><Message /></div>
              <div className="activity-content">
                <h4>New Message</h4>
                <p>You have a new message from John regarding your booking.</p>
                <p className="activity-time">Yesterday</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><Star /></div>
              <div className="activity-content">
                <h4>New Review</h4>
                <p>You received a 5-star review for "Exhibition Hall" venue.</p>
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