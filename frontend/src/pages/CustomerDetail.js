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

      <div className="customer-profile-header">
        <div className="customer-avatar">
          <span className="avatar-initials">{customer.name.charAt(0)}</span>
        </div>
        <div className="customer-header-info">
          <h2>{customer.name}</h2>
          <div className="customer-contact">
            <span className="contact-item">
              <i className="icon-email"></i> {customer.email}
            </span>
            <span className="contact-item">
              <i className="icon-phone"></i> {customer.phone}
            </span>
          </div>
          <div className="customer-meta">
            <span className="meta-item">Customer since {formatDate(customer.dateJoined)}</span>
            <span className="meta-item">Total spent: {customer.totalSpent}</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate(`/customers/${customerId}/edit`)}
          >
            Edit Customer
          </button>
          <button className="btn btn-primary">
            Book Appointment
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'pets' ? 'active' : ''}`}
          onClick={() => setActiveTab('pets')}
        >
          Pets ({activePets.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={`tab-button ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="card">
          <div className="card-header">
            <h3>Customer Information</h3>
          </div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{customer.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{customer.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{customer.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{customer.address}</span>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Notes</h4>
              <p className="detail-value notes-box">{customer.notes || 'No notes for this customer.'}</p>
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
        <div className="card">
          <div className="card-header">
            <h3>Appointments</h3>
            <div className="card-actions">
              <button className="btn btn-primary">
                + Book Appointment
              </button>
            </div>
          </div>
          <div className="card-body">
            {recentAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3>No appointments found</h3>
                <p>This customer doesn't have any appointments yet.</p>
                <button className="btn btn-primary">
                  Book First Appointment
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Service</th>
                      <th>Pet</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>{formatDateTime(appointment.date)}</td>
                        <td>{appointment.service}</td>
                        <td>{appointment.petName}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>{appointment.amount}</td>
                        <td>
                          <Link to={`/appointments/${appointment.id}`} className="btn btn-sm btn-outline-primary">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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