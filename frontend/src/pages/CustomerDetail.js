import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePets, setActivePets] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    // Simulated data for now
    // In a real implementation, this would fetch from API
    const mockCustomer = {
      id: customerId,
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, CA 90210',
      notes: 'Prefers afternoon appointments. Always pays promptly.',
      dateJoined: '2024-12-15',
      totalSpent: '$210.50',
      status: 'active'
    };
    
    const mockPets = [
      {
        id: 'pet1',
        name: 'Buddy',
        type: 'Dog',
        breed: 'Golden Retriever',
        age: '3 years',
        weight: '65 lbs',
        lastVisit: '2025-02-28'
      },
      {
        id: 'pet2',
        name: 'Max',
        type: 'Dog',
        breed: 'German Shepherd',
        age: '2 years',
        weight: '70 lbs',
        lastVisit: '2025-01-15'
      }
    ];
    
    const mockAppointments = [
      {
        id: 'apt1',
        service: 'Dog Walking',
        date: '2025-02-28T10:00:00',
        status: 'completed',
        petName: 'Buddy',
        amount: '$25.00'
      },
      {
        id: 'apt2',
        service: 'Grooming',
        date: '2025-02-15T14:30:00',
        status: 'completed',
        petName: 'Max',
        amount: '$45.00'
      },
      {
        id: 'apt3',
        service: 'Dog Walking',
        date: '2025-03-05T10:00:00',
        status: 'confirmed',
        petName: 'Buddy',
        amount: '$25.00'
      }
    ];
    
    setTimeout(() => {
      setCustomer(mockCustomer);
      setActivePets(mockPets);
      setRecentAppointments(mockAppointments);
      setLoading(false);
    }, 800);
  }, [customerId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-info';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!customer) {
    return (
      <div className="page-container">
        <PageHeader title="Customer Not Found" />
        <div className="card">
          <div className="card-body empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>Customer Not Found</h3>
            <p>The customer you're looking for doesn't exist or has been removed.</p>
            <Link to="/customers" className="btn btn-primary">
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title={`Customer: ${customer.name}`}
        backLink="/customers"
      />

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-cover-photo"></div>
          <div className="profile-avatar">
            <div className="profile-avatar-wrapper">
              <span className="profile-avatar-initials">{customer.name.charAt(0)}{customer.name.split(' ')[1]?.charAt(0) || ''}</span>
            </div>
            <span className="profile-status-badge active-badge"></span>
          </div>
        </div>
        
        <div className="profile-body">
          <div className="profile-identity">
            <h2 className="profile-name">{customer.name}</h2>
            <span className="profile-label">Active Customer</span>
          </div>
          
          <div className="profile-contact">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span className="contact-text">{customer.email}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <span className="contact-text">{customer.phone}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🏠</span>
              <span className="contact-text">{customer.address}</span>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-number">{customer.totalSpent}</div>
              <div className="stat-label">Total Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{formatDate(customer.dateJoined)}</div>
              <div className="stat-label">Customer Since</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{activePets.length}</div>
              <div className="stat-label">Pets</div>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className="btn btn-outline-primary action-btn"
              onClick={() => navigate(`/customers/${customerId}/edit`)}
            >
              <span className="btn-icon">✏️</span>
              Edit Profile
            </button>
            <Link to={`/appointments/new?customerId=${customerId}`} className="btn btn-primary action-btn">
              <span className="btn-icon">📅</span>
              Book Appointment
            </Link>
            <button className="btn btn-outline-secondary action-btn">
              <span className="btn-icon">📧</span>
              Send Email
            </button>
          </div>
        </div>
      </div>

      <div className="modern-tabs">
        <div className="tabs-inner">
          <button 
            className={`tab-item ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <span className="tab-icon">ℹ️</span>
            <span className="tab-text">Overview</span>
          </button>
          <button 
            className={`tab-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <span className="tab-icon">📅</span>
            <span className="tab-text">Appointments</span>
            <span className="tab-counter">{recentAppointments.length}</span>
          </button>
          <button 
            className={`tab-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <span className="tab-icon">💳</span>
            <span className="tab-text">Billing</span>
          </button>
          <button 
            className={`tab-item ${activeTab === 'pets' ? 'active' : ''}`}
            onClick={() => setActiveTab('pets')}
          >
            <span className="tab-icon">🐾</span>
            <span className="tab-text">Pets</span>
            <span className="tab-counter">{activePets.length}</span>
          </button>
          <div className="tab-indicator" style={{ left: `calc(${['info', 'appointments', 'billing', 'pets'].indexOf(activeTab) * 25}%)` }}></div>
        </div>
      </div>

      {activeTab === 'info' && (
        <div className="content-grid">
          <div className="detail-card">
            <div className="detail-card-header">
              <h3 className="detail-card-title">
                <span className="detail-card-icon">📋</span>
                Customer Overview
              </h3>
            </div>
            <div className="detail-card-body">
              <div className="info-section">
                <h4 className="info-section-title">About</h4>
                <p className="info-text">{customer.notes || 'No additional information available for this customer.'}</p>
              </div>
              
              <div className="info-section">
                <h4 className="info-section-title">Preferences</h4>
                <div className="preference-tags">
                  <span className="preference-tag">Afternoon appointments</span>
                  <span className="preference-tag">Electronic receipts</span>
                  <span className="preference-tag">Text reminders</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="activity-card">
            <div className="detail-card-header">
              <h3 className="detail-card-title">
                <span className="detail-card-icon">📊</span>
                Recent Activity
              </h3>
            </div>
            <div className="detail-card-body">
              <div className="activity-timeline">
                {recentAppointments.map((appointment, index) => (
                  <div key={appointment.id} className="timeline-item">
                    <div className="timeline-icon">
                      {appointment.status === 'completed' ? '✅' : '📅'}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-date">{formatDate(appointment.date)}</div>
                      <div className="timeline-title">{appointment.service}</div>
                      <div className="timeline-detail">
                        Amount: {appointment.amount} • Status: <span className={`status-text status-${appointment.status}`}>{appointment.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentAppointments.length === 0 && (
                  <div className="empty-timeline">No recent activity</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="notes-card">
            <div className="detail-card-header">
              <h3 className="detail-card-title">
                <span className="detail-card-icon">📝</span>
                Notes
              </h3>
              <button className="card-action-btn">
                <span className="card-action-icon">✏️</span>
              </button>
            </div>
            <div className="detail-card-body">
              <div className="notes-content">
                <p>{customer.notes || 'No notes have been added for this customer yet.'}</p>
              </div>
              <div className="notes-actions">
                <button className="btn btn-sm btn-outline-primary">
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pets' && (
        <div className="card">
          <div className="card-header">
            <h3>Pets</h3>
            <div className="card-actions">
              <Link to={`/pets/add?customerId=${customerId}`} className="btn btn-primary">
                + Add Pet
              </Link>
            </div>
          </div>
          <div className="card-body">
            {activePets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🐾</div>
                <h3>No pets found</h3>
                <p>This customer doesn't have any pets registered yet.</p>
                <Link to={`/pets/add?customerId=${customerId}`} className="btn btn-primary">
                  Add Pet
                </Link>
              </div>
            ) : (
              <div className="pets-grid">
                {activePets.map(pet => (
                  <div key={pet.id} className="pet-card">
                    <div className="pet-card-header">
                      <div className="pet-icon">🐕</div>
                      <h4>{pet.name}</h4>
                    </div>
                    <div className="pet-card-body">
                      <div className="pet-detail">
                        <span className="pet-detail-label">Type:</span>
                        <span className="pet-detail-value">{pet.type}</span>
                      </div>
                      <div className="pet-detail">
                        <span className="pet-detail-label">Breed:</span>
                        <span className="pet-detail-value">{pet.breed}</span>
                      </div>
                      <div className="pet-detail">
                        <span className="pet-detail-label">Age:</span>
                        <span className="pet-detail-value">{pet.age}</span>
                      </div>
                      <div className="pet-detail">
                        <span className="pet-detail-label">Weight:</span>
                        <span className="pet-detail-value">{pet.weight}</span>
                      </div>
                      <div className="pet-detail">
                        <span className="pet-detail-label">Last Visit:</span>
                        <span className="pet-detail-value">{formatDate(pet.lastVisit)}</span>
                      </div>
                    </div>
                    <div className="pet-card-footer">
                      <Link to={`/pets/${pet.id}`} className="btn btn-sm btn-outline-primary">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="appointments-container">
          <div className="appointments-header">
            <div className="appointments-title">
              <h3>Appointment History</h3>
              <span className="appointments-count">{recentAppointments.length} appointments</span>
            </div>
            <div className="appointments-filters">
              <div className="filter-group">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Upcoming</button>
                <button className="filter-btn">Past</button>
              </div>
              <Link to={`/appointments/new?customerId=${customerId}`} className="btn btn-primary">
                <span className="btn-icon">+</span> New Appointment
              </Link>
            </div>
          </div>
          
          {recentAppointments.length === 0 ? (
            <div className="empty-state modern-empty">
              <div className="empty-state-illustration">
                <span className="empty-icon">📅</span>
              </div>
              <h3 className="empty-title">No appointments yet</h3>
              <p className="empty-description">This customer doesn't have any appointments on record.</p>
              <Link to={`/appointments/new?customerId=${customerId}`} className="btn btn-primary">
                Book First Appointment
              </Link>
            </div>
          ) : (
            <div className="appointments-list">
              {recentAppointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-status">
                    <span className={`status-indicator status-${appointment.status}`}></span>
                  </div>
                  <div className="appointment-content">
                    <div className="appointment-date">
                      <span className="date-day">{new Date(appointment.date).getDate()}</span>
                      <span className="date-month">{new Date(appointment.date).toLocaleString('en-US', { month: 'short' })}</span>
                    </div>
                    <div className="appointment-details">
                      <h4 className="appointment-title">{appointment.service}</h4>
                      <div className="appointment-time">
                        {new Date(appointment.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                    <div className="appointment-meta">
                      <div className="meta-info">
                        <span className="meta-label">Price:</span>
                        <span className="meta-value">{appointment.amount}</span>
                      </div>
                      <div className="meta-info">
                        <span className="meta-label">Status:</span>
                        <span className={`meta-value status-${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <Link to={`/appointments/${appointment.id}`} className="action-btn view-btn">
                      View
                    </Link>
                    {appointment.status === 'confirmed' && (
                      <button className="action-btn cancel-btn">Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="card">
          <div className="card-header">
            <h3>Billing & Payments</h3>
          </div>
          <div className="card-body">
            <div className="billing-summary">
              <div className="billing-stat">
                <span className="billing-stat-label">Total Spent</span>
                <span className="billing-stat-value">{customer.totalSpent}</span>
              </div>
              <div className="billing-stat">
                <span className="billing-stat-label">Last Payment</span>
                <span className="billing-stat-value">$25.00 on {formatDate('2025-02-28')}</span>
              </div>
              <div className="billing-stat">
                <span className="billing-stat-label">Payment Method</span>
                <span className="billing-stat-value">Visa ending in 4242</span>
              </div>
            </div>

            <h4 className="section-title">Payment History</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{formatDate('2025-02-28')}</td>
                    <td>Payment for Dog Walking</td>
                    <td>$25.00</td>
                    <td><span className="status-badge badge-success">Completed</span></td>
                  </tr>
                  <tr>
                    <td>{formatDate('2025-02-15')}</td>
                    <td>Payment for Grooming</td>
                    <td>$45.00</td>
                    <td><span className="status-badge badge-success">Completed</span></td>
                  </tr>
                  <tr>
                    <td>{formatDate('2025-01-30')}</td>
                    <td>Payment for Training Session</td>
                    <td>$85.00</td>
                    <td><span className="status-badge badge-success">Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;