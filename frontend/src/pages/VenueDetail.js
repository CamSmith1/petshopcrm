import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const VenueDetail = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  useEffect(() => {
    // Using dummy data instead of API call for now
    setLoading(true);
    setTimeout(() => {
      const foundVenue = dummyVenues.find(v => v.id === id);
      if (foundVenue) {
        setVenue(foundVenue);
        setLoading(false);
      } else {
        setError('Venue not found');
        setLoading(false);
      }
    }, 500);
  }, [id]);

  // This would be an API call in a real app
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
    },
    {
      id: "venue-5",
      name: "Waterfront Gallery",
      description: "A contemporary art gallery with adaptable exhibition spaces, ideal for art shows and creative events.",
      category: "Gallery",
      street: "8 Beach Road",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 120,
      isPaused: false,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1526306063970-d5498ad00f1c?q=80&w=2070&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Exhibition", capacity: 120 },
        { name: "Reception", capacity: 100 }
      ],
      pricing: {
        standard: { amount: 600, unit: "day" },
        commercial: { amount: 800, unit: "day" },
        community: { amount: 400, unit: "day" }
      },
      amenities: [
        "Track lighting",
        "White walls",
        "High ceilings",
        "Projection system",
        "Reception area"
      ],
      accessibility_features: [
        "Wheelchair access",
        "Accessible restrooms"
      ],
      ratings: {
        average: 4.6,
        count: 38
      },
      bookings: {
        total: 76,
        upcoming: 4
      }
    },
    {
      id: "venue-6",
      name: "Alpine Lodge Meeting Room",
      description: "A cozy meeting space with rustic alpine decor, perfect for small business gatherings and workshops.",
      category: "Meeting Room",
      street: "56 Mountain View Road",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 30,
      isPaused: false,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=2070&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Boardroom", capacity: 20 },
        { name: "U-shape", capacity: 18 },
        { name: "Classroom", capacity: 30 }
      ],
      pricing: {
        standard: { amount: 200, unit: "day" },
        commercial: { amount: 250, unit: "day" },
        community: { amount: 150, unit: "day" }
      },
      amenities: [
        "Video conferencing",
        "Whiteboard",
        "Coffee service",
        "High-speed WiFi",
        "Natural lighting"
      ],
      accessibility_features: [
        "Wheelchair access"
      ],
      ratings: {
        average: 4.4,
        count: 26
      },
      bookings: {
        total: 145,
        upcoming: 8
      }
    },
    {
      id: "venue-7",
      name: "Lakeside Outdoor Amphitheater",
      description: "A stunning open-air venue with tiered seating overlooking the lake, perfect for concerts and performances.",
      category: "Outdoor Venue",
      street: "30 Esplanade",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 450,
      isPaused: true,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Concert", capacity: 450 },
        { name: "Theater", capacity: 400 }
      ],
      pricing: {
        standard: { amount: 1500, unit: "day" },
        commercial: { amount: 2000, unit: "day" },
        community: { amount: 1000, unit: "day" }
      },
      amenities: [
        "Sound system",
        "Stage lighting",
        "Backstage area",
        "Lake views",
        "Covered stage"
      ],
      accessibility_features: [
        "Accessible seating",
        "Paved pathways"
      ],
      ratings: {
        average: 4.9,
        count: 87
      },
      bookings: {
        total: 58,
        upcoming: 0
      }
    },
    {
      id: "venue-11",
      name: "Business Innovation Hub",
      description: "A modern, technology-enabled space designed for corporate training, hackathons, and innovation workshops.",
      category: "Business Hub",
      street: "15 Enterprise Street",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 80,
      isPaused: false,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Workshop", capacity: 80 },
        { name: "Open Plan", capacity: 60 },
        { name: "Classroom", capacity: 40 }
      ],
      pricing: {
        standard: { amount: 600, unit: "day" },
        commercial: { amount: 800, unit: "day" },
        community: { amount: 400, unit: "day" }
      },
      amenities: [
        "High-speed internet",
        "Interactive displays",
        "Modular furniture",
        "Breakout spaces",
        "Refreshment station"
      ],
      accessibility_features: [
        "Wheelchair access",
        "Accessible restrooms",
        "Height-adjustable desks"
      ],
      ratings: {
        average: 4.7,
        count: 53
      },
      bookings: {
        total: 187,
        upcoming: 11
      }
    },
    {
      id: "venue-13",
      name: "Creative Studios",
      description: "A collection of versatile studio spaces designed for creative workshops, photography sessions, and small productions.",
      category: "Creative Space",
      street: "78 Artists Lane",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 40,
      isPaused: false,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Open Studio", capacity: 40 },
        { name: "Workshop", capacity: 30 },
        { name: "Photography", capacity: 20 }
      ],
      pricing: {
        standard: { amount: 350, unit: "day" },
        commercial: { amount: 450, unit: "day" },
        community: { amount: 250, unit: "day" }
      },
      amenities: [
        "Natural lighting",
        "Blackout options",
        "Basic equipment",
        "Storage space",
        "Work tables"
      ],
      accessibility_features: [
        "Ground floor access",
        "Accessible restrooms"
      ],
      ratings: {
        average: 4.6,
        count: 42
      },
      bookings: {
        total: 168,
        upcoming: 7
      }
    },
    {
      id: "venue-14",
      name: "Mountain Retreat Conference Center",
      description: "A secluded conference center nestled in the mountains, offering a distraction-free environment for retreats and team building.",
      category: "Retreat Center",
      street: "120 Alpine Way",
      city: "Queenstown",
      state: "Otago",
      zip_code: "9300",
      max_capacity: 100,
      isPaused: true,
      images: [
        { 
          url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop",
          isPrimary: true 
        }
      ],
      layouts: [
        { name: "Conference", capacity: 100 },
        { name: "Workshop", capacity: 80 },
        { name: "Breakout Groups", capacity: 20 }
      ],
      pricing: {
        standard: { amount: 2500, unit: "day" },
        commercial: { amount: 3000, unit: "day" },
        community: { amount: 2000, unit: "day" }
      },
      amenities: [
        "Accommodation on-site",
        "Dining facilities",
        "Outdoor spaces",
        "Team building area",
        "Meditation room"
      ],
      accessibility_features: [
        "Some accessible rooms",
        "Main floor accessible"
      ],
      ratings: {
        average: 4.8,
        count: 35
      },
      bookings: {
        total: 62,
        upcoming: 0
      }
    }
  ];

  if (loading) {
    return <div className="loading">Loading venue details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!venue) {
    return <div className="not-found">Venue not found</div>;
  }

  return (
    <div className="venue-detail-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>{venue.name}</h1>
            <p className="venue-category">{venue.category}</p>
          </div>
          <div className="venue-header-actions">
            <Link to={`/manage-venues/edit/${venue.id}`} className="btn btn-primary">
              Edit Venue
            </Link>
            
            {showStatusConfirm ? (
              <div className="status-confirm">
                <span>Are you sure?</span>
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    console.log('Confirmed status toggle');
                    // In a real app, we would update venue status here
                    setShowStatusConfirm(false);
                  }}
                >
                  Yes
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => setShowStatusConfirm(false)}
                >
                  No
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => setShowStatusConfirm(true)}
              >
                {venue.isPaused ? 'Activate' : 'Pause'}
              </button>
            )}
            
            <div className="status-container">
              <span className={`status-badge ${venue.isPaused ? 'status-paused' : 'status-active'}`}>
                {venue.isPaused ? 'Paused' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="venue-content">
          <div className="venue-images">
            {venue.images && venue.images.length > 0 && (
              <img 
                src={venue.images.find(img => img.isPrimary)?.url || venue.images[0].url} 
                alt={venue.name} 
                className="primary-image"
              />
            )}
            <div className="venue-image-thumbnails">
              {venue.images && venue.images.length > 1 && venue.images.map((image, index) => (
                <img 
                  key={index}
                  src={image.url} 
                  alt={`${venue.name} view ${index + 1}`} 
                  className="image-thumbnail"
                />
              ))}
            </div>
          </div>

          <div className="venue-tabs-container">
            <div className="tabs-header">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`tab-button ${activeTab === 'layouts' ? 'active' : ''}`}
                onClick={() => setActiveTab('layouts')}
              >
                Layouts
              </button>
              <button 
                className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                Pricing
              </button>
              <button 
                className={`tab-button ${activeTab === 'amenities' ? 'active' : ''}`}
                onClick={() => setActiveTab('amenities')}
              >
                Amenities
              </button>
            </div>

            <div className="venue-tab-content">
              {activeTab === 'overview' && (
                <div className="venue-overview">
                  <h3>Description</h3>
                  <p>{venue.description}</p>
                  
                  <h3>Location</h3>
                  <p>
                    {venue.street}, {venue.city}, {venue.state} {venue.zip_code}
                  </p>
                  
                  <h3>Capacity</h3>
                  <p>Maximum capacity: {venue.max_capacity} people</p>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="venue-details-tab">
                  <div className="venue-address">
                    <h3>Address</h3>
                    <p>{venue.street}</p>
                    <p>{venue.city}, {venue.state} {venue.zip_code}</p>
                  </div>
                  
                  <div className="venue-accessibility">
                    <h3>Accessibility</h3>
                    {venue.accessibility_features && venue.accessibility_features.length > 0 ? (
                      <ul>
                        {venue.accessibility_features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No accessibility information available</p>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'layouts' && (
                <div className="venue-layouts-tab">
                  <h3>Available Layouts</h3>
                  {venue.layouts && venue.layouts.length > 0 ? (
                    <div className="layouts-grid">
                      {venue.layouts.map((layout, index) => (
                        <div key={index} className="layout-card">
                          <h4>{layout.name}</h4>
                          <p>Capacity: {layout.capacity} people</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No layout information available</p>
                  )}
                </div>
              )}
              
              {activeTab === 'pricing' && (
                <div className="venue-pricing-tab">
                  <h3>Pricing Options</h3>
                  {venue.pricing ? (
                    <div className="pricing-grid">
                      {venue.pricing.standard && (
                        <div className="pricing-card">
                          <h4>Standard Rate</h4>
                          <p className="price">${venue.pricing.standard.amount}</p>
                          <p className="price-unit">per {venue.pricing.standard.unit}</p>
                        </div>
                      )}
                      
                      {venue.pricing.commercial && (
                        <div className="pricing-card">
                          <h4>Commercial Rate</h4>
                          <p className="price">${venue.pricing.commercial.amount}</p>
                          <p className="price-unit">per {venue.pricing.commercial.unit}</p>
                        </div>
                      )}
                      
                      {venue.pricing.community && (
                        <div className="pricing-card">
                          <h4>Community Rate</h4>
                          <p className="price">${venue.pricing.community.amount}</p>
                          <p className="price-unit">per {venue.pricing.community.unit}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>No pricing information available</p>
                  )}
                </div>
              )}
              
              {activeTab === 'amenities' && (
                <div className="venue-amenities-tab">
                  <h3>Amenities</h3>
                  {venue.amenities && venue.amenities.length > 0 ? (
                    <div className="amenities-list">
                      {venue.amenities.map((amenity, index) => (
                        <div key={index} className="amenity-item">
                          <span className="amenity-icon">✓</span>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No amenities information available</p>
                  )}
                </div>
              )}
            </div>
          </div>
                
          {venue.bookings && (
            <div className="venue-stats-card">
              <h3>Booking Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{venue.bookings.total}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{venue.bookings.upcoming}</div>
                  <div className="stat-label">Upcoming</div>
                </div>
                {venue.ratings && (
                  <div className="stat-item">
                    <div className="stat-value">{venue.ratings.average}</div>
                    <div className="stat-label">Rating</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;