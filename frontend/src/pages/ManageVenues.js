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
    // Using dummy data instead of API call
    setLoading(true);
    setTimeout(() => {
      setVenues(dummyVenues);
      setLoading(false);
    }, 500); // Simulate loading delay
  }, []);
  
  // Dummy venue data for demonstration
  const dummyVenues = [
    {
      id: "venue-1",
      name: "Queenstown Conference Center",
      description: "A modern conference center with stunning lake views, perfect for corporate events and large gatherings.",
      category: "Conference Hall",
      street: "10 Lake Road",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 500,
      isPaused: false,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
          isPrimary: true 
        },
        { 
          url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070&auto=format&fit=crop",
          isPrimary: false 
        }
      ],
      layouts: [
        { name: "Theater", capacity: 500 },
        { name: "Banquet", capacity: 300 },
        { name: "Classroom", capacity: 250 }
      ],
      pricing: {
        standard: { amount: 1200, unit: "day" },
        commercial: { amount: 1500, unit: "day" },
        community: { amount: 800, unit: "day" }
      },
      amenities: [
        "High-speed WiFi",
        "Advanced AV equipment",
        "Catering services",
        "Breakout rooms",
        "Stage with lighting"
      ],
      accessibility_features: [
        "Wheelchair access",
        "Accessible restrooms",
        "Hearing loop",
        "Elevator access"
      ],
      ratings: {
        average: 4.8,
        count: 45
      },
      bookings: {
        total: 128,
        upcoming: 12
      }
    },
    {
      id: "venue-2",
      name: "Lakeside Pavilion",
      description: "An elegant glass-walled pavilion situated on the lakefront, perfect for weddings and special celebrations.",
      category: "Multi-purpose Venue",
      street: "25 Marine Parade",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 200,
      isPaused: false,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Banquet", capacity: 200 },
        { name: "Cocktail", capacity: 250 },
        { name: "Ceremony", capacity: 180 }
      ],
      pricing: {
        standard: { amount: 2500, unit: "day" },
        commercial: { amount: 3000, unit: "day" },
        community: { amount: 1800, unit: "day" }
      },
      amenities: [
        "Panoramic lake views",
        "Built-in sound system",
        "Dance floor",
        "Private terrace",
        "Bridal suite"
      ],
      accessibility_features: [
        "Wheelchair access",
        "Accessible restrooms",
        "Flat entrance"
      ],
      ratings: {
        average: 4.9,
        count: 78
      },
      bookings: {
        total: 95,
        upcoming: 8
      }
    },
    {
      id: "venue-3",
      name: "Mountain View Studio",
      description: "A versatile studio space with floor-to-ceiling windows offering breathtaking mountain views.",
      category: "Studio",
      street: "42 Remarkables Road",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 60,
      isPaused: true,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1604014056084-c96b1daefbaf?q=80&w=2070&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Workshop", capacity: 60 },
        { name: "Seminar", capacity: 50 },
        { name: "Yoga/Dance", capacity: 40 }
      ],
      pricing: {
        standard: { amount: 350, unit: "day" },
        commercial: { amount: 450, unit: "day" },
        community: { amount: 250, unit: "day" }
      },
      amenities: [
        "Sprung wooden floor",
        "Mirror wall",
        "Sound system",
        "Kitchenette",
        "Changing rooms"
      ],
      accessibility_features: [
        "Wheelchair access",
        "Accessible restrooms"
      ],
      ratings: {
        average: 4.7,
        count: 32
      },
      bookings: {
        total: 210,
        upcoming: 0
      }
    },
    {
      id: "venue-4",
      name: "Arrowtown Community Hall",
      description: "A rustic heritage hall in the heart of historic Arrowtown, ideal for community events and gatherings.",
      category: "Community Hall",
      street: "15 Buckingham Street",
      city: "Arrowtown",
      state: "Otago",
      zip_code: "9302",
      max_capacity: 150,
      isPaused: false,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2073&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Theater", capacity: 150 },
        { name: "Banquet", capacity: 100 },
        { name: "Exhibition", capacity: 120 }
      ],
      pricing: {
        standard: { amount: 400, unit: "day" },
        commercial: { amount: 600, unit: "day" },
        community: { amount: 200, unit: "day" }
      },
      amenities: [
        "Historic architecture",
        "Stage area",
        "Kitchen facilities",
        "Outdoor courtyard",
        "Heating system"
      ],
      accessibility_features: [
        "Ramp access",
        "Accessible restrooms"
      ],
      ratings: {
        average: 4.5,
        count: 65
      },
      bookings: {
        total: 320,
        upcoming: 5
      }
    }
  ];
  
  const fetchVenues = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch from API
      const response = await api.getVenues({ owner: user.id });
      setVenues(response.data.venues);
      setLoading(false);
    } catch (err) {
      setError('Error fetching venues. Please try again.');
      setLoading(false);
    }
  };
  
  const handleToggleStatus = async (venueId, currentStatus) => {
    try {
      // In a real app, we would call API
      await api.updateVenue(venueId, { isPaused: !currentStatus });
      
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
      await api.deleteVenue(venueId);
      
      // Update local state
      setVenues(venues.filter(venue => venue.id !== venueId));
    } catch (err) {
      setError('Error deleting venue. Please try again.');
    }
  };
  
  // Access restriction removed to allow all users to view venues
  
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
                    <p><strong>Address:</strong> {venue.street}, {venue.city}, {venue.state} {venue.zip_code}</p>
                    <p><strong>Capacity:</strong> Up to {venue.max_capacity} people</p>
                    {venue.layouts && venue.layouts.length > 0 && (
                      <p><strong>Layouts:</strong> {venue.layouts.map(layout => `${layout.name} (${layout.capacity})`).join(', ')}</p>
                    )}
                    
                    {/* Display pricing tiers if they exist */}
                    {venue.pricing && (
                      <div className="pricing-section">
                        <p><strong>Pricing:</strong></p>
                        <ul className="pricing-list">
                          {venue.pricing.standard && (
                            <li>Standard: ${venue.pricing.standard.amount}/{venue.pricing.standard.unit}</li>
                          )}
                          {venue.pricing.commercial && (
                            <li>Commercial: ${venue.pricing.commercial.amount}/{venue.pricing.commercial.unit}</li>
                          )}
                          {venue.pricing.community && (
                            <li>Community: ${venue.pricing.community.amount}/{venue.pricing.community.unit}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="venue-features">
                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="feature-section">
                        <h4>Amenities</h4>
                        <ul>
                          {venue.amenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {venue.accessibility_features && venue.accessibility_features.length > 0 && (
                      <div className="feature-section">
                        <h4>Accessibility</h4>
                        <ul>
                          {venue.accessibility_features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="venue-stats">
                    {venue.ratings && (
                      <>
                        <div className="stat">
                          <span className="stat-value">{venue.ratings.average}</span>
                          <span className="stat-label">Rating</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{venue.ratings.count}</span>
                          <span className="stat-label">Reviews</span>
                        </div>
                      </>
                    )}
                    {venue.bookings && (
                      <>
                        <div className="stat">
                          <span className="stat-value">{venue.bookings.total}</span>
                          <span className="stat-label">Bookings</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{venue.bookings.upcoming}</span>
                          <span className="stat-label">Upcoming</span>
                        </div>
                      </>
                    )}
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
                  <Link to={`/manage-venues/${venue.id}/images`} className="btn btn-info">
                    Manage Images
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
                    disabled={venue.bookings && venue.bookings.upcoming > 0}
                  >
                    Delete
                  </button>
                  {venue.bookings && venue.bookings.upcoming > 0 && (
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