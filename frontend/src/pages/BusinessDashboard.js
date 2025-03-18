import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BusinessDashboard = () => {
  const { currentUser } = useAuth();
  
  // Mock data for dashboard
  const stats = [
    { 
      id: 1, 
      label: 'Total Bookings', 
      value: 152, 
      icon: '🗓️', 
      iconClass: 'icon-primary', 
      change: 12, 
      changeType: 'up' 
    },
    { 
      id: 2, 
      label: 'Upcoming Today', 
      value: 8, 
      icon: '📊', 
      iconClass: 'icon-warning', 
      change: 2, 
      changeType: 'up' 
    },
    { 
      id: 3, 
      label: 'Customers', 
      value: 47, 
      icon: '👤', 
      iconClass: 'icon-success', 
      change: 5, 
      changeType: 'up' 
    },
    { 
      id: 4, 
      label: 'Revenue This Month', 
      value: '$4,275', 
      icon: '📈', 
      iconClass: 'icon-success', 
      change: 15, 
      changeType: 'up' 
    }
  ];
  
  const upcomingBookings = [
    {
      id: 'book-1',
      customerName: 'John Smith',
      customerEmail: 'john.smith@example.com',
      venue: 'Conference Room A',
      date: '2025-03-03',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: 'book-2',
      customerName: 'Mary Johnson',
      customerEmail: 'mary.j@example.com',
      venue: 'Main Hall',
      date: '2025-03-03',
      time: '01:30 PM',
      status: 'confirmed'
    },
    {
      id: 'book-3',
      customerName: 'David Williams',
      customerEmail: 'david.w@example.com',
      venue: 'Exhibition Space',
      date: '2025-03-03',
      time: '03:45 PM',
      status: 'pending'
    },
    {
      id: 'book-4',
      customerName: 'Sarah Miller',
      customerEmail: 'sarah.miller@example.com',
      venue: 'Meeting Room B',
      date: '2025-03-04',
      time: '09:15 AM',
      status: 'confirmed'
    },
    {
      id: 'book-5',
      customerName: 'Michael Brown',
      customerEmail: 'mbrown@example.com',
      venue: 'Auditorium',
      date: '2025-03-04',
      time: '11:00 AM',
      status: 'confirmed'
    }
  ];
  
  const pastBookings = [
    {
      id: 'past-1',
      customerName: 'Emily Davis',
      customerEmail: 'emily@example.com',
      venue: 'Main Hall',
      date: '2025-03-01',
      time: '13:00 PM',
      status: 'completed',
      eventType: 'Conference'
    },
    {
      id: 'past-2',
      customerName: 'Robert Wilson',
      customerEmail: 'robert@example.com',
      venue: 'Exhibition Space',
      date: '2025-02-28',
      time: '09:30 AM',
      status: 'completed',
      eventType: 'Workshop'
    },
    {
      id: 'past-3',
      customerName: 'Jennifer Taylor',
      customerEmail: 'jennifer@example.com',
      venue: 'Conference Room B',
      date: '2025-02-27',
      time: '15:45 PM',
      status: 'completed',
      eventType: 'Meeting'
    },
    {
      id: 'past-4',
      customerName: 'Thomas Lee',
      customerEmail: 'tlee@example.com',
      venue: 'Auditorium',
      date: '2025-02-26',
      time: '18:00 PM',
      status: 'completed',
      eventType: 'Presentation'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Welcome back, {currentUser?.name || 'Business Owner'}
          </p>
        </div>
        
        <div className="header-actions">
          <Link to="/calendar" className="btn btn-primary">
            <span className="btn-icon">📅</span>
            View Schedule
          </Link>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-4">
        {stats.map(stat => (
          <div className="card" key={stat.id}>
            <div className="stats-card">
              <div className={`stats-icon ${stat.iconClass}`}>
                {stat.icon}
              </div>
              <div className="stats-info">
                <div className="stats-value">
                  {stat.value}
                  {stat.change && (
                    <span className={`stats-change change-${stat.changeType}`}>
                      {stat.changeType === 'up' ? '↑' : '↓'} {stat.change}%
                    </span>
                  )}
                </div>
                <div className="stats-label">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Upcoming Bookings Section */}
      <div className="card mb-4 mt-4">
        <div className="card-header">
          <h2 className="card-title">Upcoming Bookings</h2>
          <div className="card-actions">
            <Link to="/bookings" className="btn btn-sm btn-secondary">
              View All
            </Link>
          </div>
        </div>
        
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Venue</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.customerName}</td>
                    <td>{booking.customerEmail}</td>
                    <td>{booking.venue}</td>
                    <td>
                      {new Date(booking.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {booking.time}
                    </td>
                    <td>
                      <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : 'warning'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/bookings/${booking.id}`} className="btn btn-sm btn-secondary">
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Bottom Row: Past Bookings and Quick Actions */}
      <div className="grid grid-2">
        {/* Past Bookings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Past Bookings</h2>
            <div className="card-actions">
              <Link to="/bookings?status=completed" className="btn btn-sm btn-secondary">
                View All
              </Link>
            </div>
          </div>
          
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Venue</th>
                    <th>Event Type</th>
                  </tr>
                </thead>
                <tbody>
                  {pastBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>
                        {new Date(booking.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {booking.time}
                      </td>
                      <td>
                        <Link to={`/customers/${booking.id.replace('past-', 'cust-')}`} className="text-primary">
                          {booking.customerName}
                        </Link>
                      </td>
                      <td>{booking.venue}</td>
                      <td>{booking.eventType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Quick Actions Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          
          <div className="card-body">
            <div style={{ display: 'grid', gap: '10px' }}>
              <Link to="/bookings/new" className="btn btn-primary" style={{ width: '100%' }}>
                <span className="btn-icon">➕</span>
                Create New Booking
              </Link>
              
              <Link to="/customers/new" className="btn btn-secondary" style={{ width: '100%' }}>
                <span className="btn-icon">👤</span>
                Add New Customer
              </Link>
              
              <Link to="/services/new" className="btn btn-secondary" style={{ width: '100%' }}>
                <span className="btn-icon">🛠️</span>
                Add New Service
              </Link>
              
              <Link to="/booking-page-setup" className="btn btn-secondary" style={{ width: '100%' }}>
                <span className="btn-icon">🔗</span>
                Manage Booking Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;