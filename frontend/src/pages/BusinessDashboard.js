import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BusinessDashboard = () => {
  const { currentUser } = useAuth();
  
  // Mock data for dashboard
  const stats = [
    { 
      id: 1, 
      label: 'Total Appointments', 
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
  
  const upcomingAppointments = [
    {
      id: 'appt-1',
      customerName: 'John Smith',
      petName: 'Buddy',
      service: 'Dog Grooming',
      date: '2025-03-03',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: 'appt-2',
      customerName: 'Mary Johnson',
      petName: 'Max',
      service: 'Dog Walking',
      date: '2025-03-03',
      time: '01:30 PM',
      status: 'confirmed'
    },
    {
      id: 'appt-3',
      customerName: 'David Williams',
      petName: 'Charlie',
      service: 'Nail Trimming',
      date: '2025-03-03',
      time: '03:45 PM',
      status: 'pending'
    },
    {
      id: 'appt-4',
      customerName: 'Sarah Miller',
      petName: 'Luna',
      service: 'Bath & Brush',
      date: '2025-03-04',
      time: '09:15 AM',
      status: 'confirmed'
    },
    {
      id: 'appt-5',
      customerName: 'Michael Brown',
      petName: 'Rocky',
      service: 'Full Grooming',
      date: '2025-03-04',
      time: '11:00 AM',
      status: 'confirmed'
    }
  ];
  
  const recentCustomers = [
    {
      id: 'cust-1',
      name: 'Emily Davis',
      email: 'emily@example.com',
      pets: 2,
      lastVisit: '2025-03-01',
      totalSpent: '$320'
    },
    {
      id: 'cust-2',
      name: 'Robert Wilson',
      email: 'robert@example.com',
      pets: 1,
      lastVisit: '2025-02-28',
      totalSpent: '$145'
    },
    {
      id: 'cust-3',
      name: 'Jennifer Taylor',
      email: 'jennifer@example.com',
      pets: 3,
      lastVisit: '2025-02-27',
      totalSpent: '$490'
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
      
      {/* Upcoming Appointments Section */}
      <div className="card mb-4 mt-4">
        <div className="card-header">
          <h2 className="card-title">Upcoming Appointments</h2>
          <div className="card-actions">
            <Link to="/appointments" className="btn btn-sm btn-secondary">
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
                  <th>Pet</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td>{appointment.customerName}</td>
                    <td>{appointment.petName}</td>
                    <td>{appointment.service}</td>
                    <td>
                      {new Date(appointment.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {appointment.time}
                    </td>
                    <td>
                      <span className={`badge badge-${appointment.status === 'confirmed' ? 'success' : 'warning'}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/appointments/${appointment.id}`} className="btn btn-sm btn-secondary">
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
      
      {/* Bottom Row: Recent Customers and Quick Actions */}
      <div className="grid grid-2">
        {/* Recent Customers */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Customers</h2>
            <div className="card-actions">
              <Link to="/customers" className="btn btn-sm btn-secondary">
                View All
              </Link>
            </div>
          </div>
          
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Pets</th>
                    <th>Last Visit</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <Link to={`/customers/${customer.id}`} className="text-primary">
                          {customer.name}
                        </Link>
                      </td>
                      <td>{customer.pets}</td>
                      <td>
                        {new Date(customer.lastVisit).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td>{customer.totalSpent}</td>
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
              <Link to="/appointments/new" className="btn btn-primary" style={{ width: '100%' }}>
                <span className="btn-icon">➕</span>
                Create New Appointment
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