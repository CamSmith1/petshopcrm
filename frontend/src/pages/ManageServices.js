import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const ManageVenues = () => {
  const { user } = useContext(AuthContext);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchVenues();
  }, []);
  
  const fetchVenues = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from API
      // const response = await api.getVenues({ owner: user.id });
      // setVenues(response.data.venues);
      
      // Mock venues data
      setVenues([
        {
          id: '1',
          name: 'Community Hall',
          category: 'hall',
          description: 'Large community hall ideal for events, conferences, and gatherings up to 200 people.',
          address: {
            street: '123 Main St',
            city: 'Townsville',
            state: 'TS',
            zipCode: '12345',
            country: 'USA'
          },
          maxCapacity: 200,
          amenities: ['WiFi', 'AV Equipment', 'Kitchen', 'Parking', 'Accessible Entrance'],
          accessibilityFeatures: ['Wheelchair Access', 'Hearing Loop', 'Accessible Restrooms'],
          layouts: [
            { id: '101', name: 'Theater', capacity: 200 },
            { id: '102', name: 'Banquet', capacity: 150 },
            { id: '103', name: 'Classroom', capacity: 100 }
          ],
          pricing: {
            standard: { amount: 150, unit: 'hour' },
            commercial: { amount: 200, unit: 'hour' },
            community: { amount: 100, unit: 'hour' }
          },
          isPaused: false,
          images: [
            { url: 'https://example.com/venue1_1.jpg', isPrimary: true },
            { url: 'https://example.com/venue1_2.jpg' }
          ],
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
          name: 'Conference Room A',
          category: 'meeting',
          description: 'Modern conference room with high-speed internet and video conferencing capabilities.',
          address: {
            street: '456 Business Ave',
            city: 'Metropolis',
            state: 'MP',
            zipCode: '67890',
            country: 'USA'
          },
          maxCapacity: 30,
          amenities: ['WiFi', 'Video Conferencing', 'Whiteboard', 'Coffee Service'],
          accessibilityFeatures: ['Wheelchair Access', 'Accessible Restrooms'],
          layouts: [
            { id: '201', name: 'Boardroom', capacity: 20 },
            { id: '202', name: 'U-Shape', capacity: 16 }
          ],
          pricing: {
            standard: { amount: 75, unit: 'hour' },
            commercial: { amount: 100, unit: 'hour' },
            community: { amount: 50, unit: 'hour' }
          },
          isPaused: false,
          images: [
            { url: 'https://example.com/venue2_1.jpg', isPrimary: true }
          ],
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
          name: 'Banquet Hall',
          category: 'banquet',
          description: 'Elegant banquet hall perfect for weddings, parties, and formal events.',
          address: {
            street: '789 Celebration Blvd',
            city: 'Festivity',
            state: 'FT',
            zipCode: '45678',
            country: 'USA'
          },
          maxCapacity: 150,
          amenities: ['Dance Floor', 'Sound System', 'Kitchen', 'Bar Area', 'Coat Check'],
          accessibilityFeatures: ['Wheelchair Access', 'Accessible Parking', 'Accessible Restrooms'],
          layouts: [
            { id: '301', name: 'Banquet', capacity: 150 },
            { id: '302', name: 'Reception', capacity: 200 }
          ],
          pricing: {
            standard: { amount: 2000, unit: 'day' },
            commercial: { amount: 2500, unit: 'day' },
            community: { amount: 1500, unit: 'day' }
          },
          isPaused: true,
          images: [
            { url: 'https://example.com/venue3_1.jpg', isPrimary: true },
            { url: 'https://example.com/venue3_2.jpg' }
          ],
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
      setError('Error fetching venues. Please try again.');
      setLoading(false);
    }
  };
  
  const handleToggleStatus = async (venueId, currentStatus) => {
    try {
      // In a real app, we would call API
      // await api.updateVenue(venueId, { isPaused: !currentStatus });
      
      // Update local state
      setVenues(venues.map(venue => 
        venue.id === venueId 
          ? { ...venue, isPaused: !venue.isPaused } 
          : venue
      ));
    } catch (err) {
      setError('Error updating venue status. Please try again.');
    }
  };
  
  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      return;
    }
    
    try {
      // In a real app, we would call API
      // await api.deleteVenue(venueId);
      
      // Update local state
      setVenues(venues.filter(venue => venue.id !== venueId));
    } catch (err) {
      setError('Error deleting venue. Please try again.');
    }
  };
  
  if (!user || user.role !== 'venue_owner') {
    return (
      <div className="unauthorized-message">
        <h2>Access Denied</h2>
        <p>You must be a venue owner to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="manage-venues-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage Venues</h1>
          <Link to="/manage-venues/create" className="btn btn-primary">
            Add New Venue
          </Link>
        </div>
        
        {loading ? (
          <div className="loading">Loading venues...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : venues.length === 0 ? (
          <div className="no-venues">
            <p>You haven't added any venues yet.</p>
            <Link to="/manage-venues/create" className="btn btn-primary">
              Add Your First Venue
            </Link>
          </div>
        ) : (
          <div className="venues-list">
            {venues.map(venue => (
              <div key={venue.id} className="venue-card">
                <div className="venue-header">
                  <h3>{venue.name}</h3>
                  <span className={`status-badge ${venue.isPaused ? 'status-paused' : 'status-active'}`}>
                    {venue.isPaused ? 'Paused' : 'Active'}
                  </span>
                </div>
                
                <div className="venue-body">
                  <div className="venue-image">
                    {venue.images && venue.images.length > 0 && (
                      <img 
                        src={venue.images.find(img => img.isPrimary)?.url || venue.images[0].url} 
                        alt={venue.name} 
                      />
                    )}
                  </div>
                  
                  <div className="venue-details">
                    <p><strong>Category:</strong> {venue.category}</p>
                    <p><strong>Description:</strong> {venue.description}</p>
                    <p><strong>Address:</strong> {venue.address.street}, {venue.address.city}, {venue.address.state} {venue.address.zipCode}</p>
                    <p><strong>Capacity:</strong> Up to {venue.maxCapacity} people</p>
                    <p><strong>Layouts:</strong> {venue.layouts.map(layout => `${layout.name} (${layout.capacity})`).join(', ')}</p>
                    <p><strong>Pricing:</strong></p>
                    <ul className="pricing-list">
                      <li>Standard: ${venue.pricing.standard.amount}/{venue.pricing.standard.unit}</li>
                      <li>Commercial: ${venue.pricing.commercial.amount}/{venue.pricing.commercial.unit}</li>
                      <li>Community: ${venue.pricing.community.amount}/{venue.pricing.community.unit}</li>
                    </ul>
                  </div>
                  
                  <div className="venue-features">
                    <div className="feature-section">
                      <h4>Amenities</h4>
                      <ul>
                        {venue.amenities.map((amenity, index) => (
                          <li key={index}>{amenity}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="feature-section">
                      <h4>Accessibility</h4>
                      <ul>
                        {venue.accessibilityFeatures.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="venue-stats">
                    <div className="stat">
                      <span className="stat-value">{venue.ratings.average}</span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{venue.ratings.count}</span>
                      <span className="stat-label">Reviews</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{venue.bookings.total}</span>
                      <span className="stat-label">Bookings</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{venue.bookings.upcoming}</span>
                      <span className="stat-label">Upcoming</span>
                    </div>
                  </div>
                </div>
                
                <div className="venue-actions">
                  <Link to={`/manage-venues/edit/${venue.id}`} className="btn btn-secondary">
                    Edit Venue
                  </Link>
                  <Link to={`/manage-venues/${venue.id}/layouts`} className="btn btn-info">
                    Manage Layouts
                  </Link>
                  <Link to={`/manage-venues/${venue.id}/equipment`} className="btn btn-info">
                    Manage Equipment
                  </Link>
                  <Link to={`/manage-venues/${venue.id}/bonds`} className="btn btn-info">
                    Manage Bonds
                  </Link>
                  <Link to={`/manage-venues/${venue.id}/availability`} className="btn btn-info">
                    Set Availability
                  </Link>
                  <button 
                    className={`btn ${venue.isPaused ? 'btn-success' : 'btn-warning'}`}
                    onClick={() => handleToggleStatus(venue.id, venue.isPaused)}
                  >
                    {venue.isPaused ? 'Activate' : 'Pause'}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteVenue(venue.id)}
                    disabled={venue.bookings.upcoming > 0}
                  >
                    Delete
                  </button>
                  {venue.bookings.upcoming > 0 && (
                    <p className="delete-warning">Cannot delete venue with upcoming bookings</p>
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

export default ManageVenues;