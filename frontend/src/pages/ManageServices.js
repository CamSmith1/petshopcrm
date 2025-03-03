import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const ManageServices = () => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchServices();
  }, []);
  
  const fetchServices = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from API
      // const response = await api.getServices({ provider: user.id });
      // setServices(response.data.services);
      
      // Mock services data
      setServices([
        {
          id: '1',
          title: 'Dog Grooming - Full Service',
          category: 'grooming',
          description: 'Full grooming service including bath, haircut, nail trimming, and ear cleaning.',
          price: {
            amount: 50,
            currency: 'USD',
            unit: 'per_session'
          },
          duration: 60, // in minutes
          isPaused: false,
          ratings: {
            average: 4.8,
            count: 25
          },
          bookings: {
            total: 42,
            upcoming: 3
          }
        },
        {
          id: '2',
          title: 'Basic Training Package',
          category: 'training',
          description: 'Basic obedience training including sit, stay, come, and leash walking.',
          price: {
            amount: 40,
            currency: 'USD',
            unit: 'per_hour'
          },
          duration: 60, // in minutes
          isPaused: false,
          ratings: {
            average: 4.6,
            count: 18
          },
          bookings: {
            total: 35,
            upcoming: 2
          }
        },
        {
          id: '3',
          title: 'Dog Walking Service',
          category: 'walking',
          description: '30-minute dog walking service with exercise and bathroom breaks.',
          price: {
            amount: 25,
            currency: 'USD',
            unit: 'per_session'
          },
          duration: 30, // in minutes
          isPaused: true,
          ratings: {
            average: 4.7,
            count: 15
          },
          bookings: {
            total: 120,
            upcoming: 0
          }
        }
      ]);
      
      setLoading(false);
    } catch (err) {
      setError('Error fetching services. Please try again.');
      setLoading(false);
    }
  };
  
  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      // In a real app, we would call API
      // await api.updateService(serviceId, { isPaused: !currentStatus });
      
      // Update local state
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, isPaused: !service.isPaused } 
          : service
      ));
    } catch (err) {
      setError('Error updating service status. Please try again.');
    }
  };
  
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    
    try {
      // In a real app, we would call API
      // await api.deleteService(serviceId);
      
      // Update local state
      setServices(services.filter(service => service.id !== serviceId));
    } catch (err) {
      setError('Error deleting service. Please try again.');
    }
  };
  
  if (!user || user.role !== 'service_provider') {
    return (
      <div className="unauthorized-message">
        <h2>Access Denied</h2>
        <p>You must be a service provider to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="manage-services-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage Services</h1>
          <Link to="/manage-services/create" className="btn btn-primary">
            Add New Service
          </Link>
        </div>
        
        {loading ? (
          <div className="loading">Loading services...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : services.length === 0 ? (
          <div className="no-services">
            <p>You haven't added any services yet.</p>
            <Link to="/manage-services/create" className="btn btn-primary">
              Add Your First Service
            </Link>
          </div>
        ) : (
          <div className="services-list">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <h3>{service.title}</h3>
                  <span className={`status-badge ${service.isPaused ? 'status-paused' : 'status-active'}`}>
                    {service.isPaused ? 'Paused' : 'Active'}
                  </span>
                </div>
                
                <div className="service-body">
                  <div className="service-details">
                    <p><strong>Category:</strong> {service.category}</p>
                    <p><strong>Description:</strong> {service.description}</p>
                    <p><strong>Price:</strong> ${service.price.amount} {service.price.unit === 'per_hour' ? '/ hour' : '/ session'}</p>
                    <p><strong>Duration:</strong> {service.duration} minutes</p>
                  </div>
                  
                  <div className="service-stats">
                    <div className="stat">
                      <span className="stat-value">{service.ratings.average}</span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{service.ratings.count}</span>
                      <span className="stat-label">Reviews</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{service.bookings.total}</span>
                      <span className="stat-label">Bookings</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{service.bookings.upcoming}</span>
                      <span className="stat-label">Upcoming</span>
                    </div>
                  </div>
                </div>
                
                <div className="service-actions">
                  <Link to={`/manage-services/edit/${service.id}`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button 
                    className={`btn ${service.isPaused ? 'btn-success' : 'btn-warning'}`}
                    onClick={() => handleToggleStatus(service.id, service.isPaused)}
                  >
                    {service.isPaused ? 'Activate' : 'Pause'}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteService(service.id)}
                    disabled={service.bookings.upcoming > 0}
                  >
                    Delete
                  </button>
                  {service.bookings.upcoming > 0 && (
                    <p className="delete-warning">Cannot delete service with upcoming bookings</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageServices;