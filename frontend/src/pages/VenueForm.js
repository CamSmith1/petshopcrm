import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/venue-management.css';

const VenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic information
    name: '',
    description: '',
    category: '',
    
    // Location
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'New Zealand', // Default to New Zealand
    
    // Capacity & Dimensions
    max_capacity: '',
    min_capacity: '',
    dimensions: '',
    
    // Pricing & Booking
    hourly_rate: '',
    daily_rate: '',
    setup_time: 60, // Default setup time in minutes
    teardown_time: 60, // Default teardown time in minutes
    deposit_required: false,
    deposit_amount: '',
    insurance_required: false,
    cancellation_policy: '',
    
    // Availability
    availability: {
      monday: { start: '08:00', end: '22:00', available: true },
      tuesday: { start: '08:00', end: '22:00', available: true },
      wednesday: { start: '08:00', end: '22:00', available: true },
      thursday: { start: '08:00', end: '22:00', available: true },
      friday: { start: '08:00', end: '22:00', available: true },
      saturday: { start: '09:00', end: '22:00', available: true },
      sunday: { start: '09:00', end: '22:00', available: true }
    },
    
    // Features
    amenities: [],
    accessibility_features: [],
    suitability: [], // What the venue is suitable for
    restrictions: [], // Any restrictions
    
    // Additional Information
    additional_notes: ''
  });
  
  // Lists for dropdown selections
  const categoryOptions = [
    'Conference Hall', 
    'Meeting Room', 
    'Banquet Hall', 
    'Auditorium', 
    'Outdoor Space', 
    'Studio', 
    'Classroom', 
    'Exhibition Space',
    'Community Hall',
    'Sports Facility',
    'Multi-purpose Venue',
    'Other'
  ];

  const suitabilityOptions = [
    'Conferences', 
    'Meetings', 
    'Workshops', 
    'Exhibitions', 
    'Performances', 
    'Weddings', 
    'Parties', 
    'Sports Events',
    'Fitness Classes',
    'Presentations',
    'Corporate Events',
    'Educational Events'
  ];

  const restrictionOptions = [
    'No Alcohol', 
    'No Food', 
    'No Smoking', 
    'No Loud Music',
    'No Decorations on Walls',
    'No Open Flames',
    'No Confetti',
    'No After-hours Access'
  ];
  
  const amenityOptions = [
    'WiFi', 
    'AV Equipment', 
    'Kitchen', 
    'Parking', 
    'Air Conditioning', 
    'Heating', 
    'Natural Light', 
    'Stage', 
    'Sound System', 
    'Projector', 
    'Tables', 
    'Chairs', 
    'Whiteboard', 
    'Bar Area', 
    'Dance Floor', 
    'Coat Check', 
    'Outdoor Space'
  ];
  
  const accessibilityOptions = [
    'Wheelchair Access', 
    'Accessible Restrooms', 
    'Accessible Parking', 
    'Hearing Loop', 
    'Elevator', 
    'Ramp', 
    'Braille Signage', 
    'Service Animal Friendly'
  ];
  
  // Check if editing existing venue
  const isEditing = Boolean(id);
  
  // Load venue data if editing
  useEffect(() => {
    if (isEditing) {
      fetchVenue();
    }
  }, [id]);
  
  const fetchVenue = async () => {
    try {
      setLoading(true);
      const response = await api.getVenue(id);
      const venue = response.data.venue;
      
      // Set form data from venue
      setFormData({
        // Basic information
        name: venue.name || '',
        description: venue.description || '',
        category: venue.category || '',
        
        // Location
        street: venue.street || '',
        city: venue.city || '',
        state: venue.state || '',
        zip_code: venue.zip_code || '',
        country: venue.country || 'New Zealand',
        
        // Capacity & Dimensions
        max_capacity: venue.max_capacity || '',
        min_capacity: venue.min_capacity || '',
        dimensions: venue.dimensions || '',
        
        // Pricing & Booking
        hourly_rate: venue.hourly_rate || '',
        daily_rate: venue.daily_rate || '',
        setup_time: venue.setup_time || 60,
        teardown_time: venue.teardown_time || 60,
        deposit_required: venue.deposit_required || false,
        deposit_amount: venue.deposit_amount || '',
        insurance_required: venue.insurance_required || false,
        cancellation_policy: venue.cancellation_policy || '',
        
        // Availability
        availability: venue.availability || {
          monday: { start: '08:00', end: '22:00', available: true },
          tuesday: { start: '08:00', end: '22:00', available: true },
          wednesday: { start: '08:00', end: '22:00', available: true },
          thursday: { start: '08:00', end: '22:00', available: true },
          friday: { start: '08:00', end: '22:00', available: true },
          saturday: { start: '09:00', end: '22:00', available: true },
          sunday: { start: '09:00', end: '22:00', available: true }
        },
        
        // Features
        amenities: venue.amenities || [],
        accessibility_features: venue.accessibility_features || [],
        suitability: venue.suitability || [],
        restrictions: venue.restrictions || [],
        
        // Additional Information
        additional_notes: venue.additional_notes || ''
      });
      
      setLoading(false);
    } catch (err) {
      setError('Error loading venue data. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Only allow positive numbers
    if (value === '' || parseInt(value) >= 0) {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked
    }));
  };
  
  // Handle availability changes
  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      availability: {
        ...prevData.availability,
        [day]: {
          ...prevData.availability[day],
          [field]: field === 'available' ? value : value
        }
      }
    }));
  };
  
  // Handle multi-select changes (both for checkboxes and tags)
  const handleMultiSelectChange = (name, value) => {
    // Check if item is already selected
    if (formData[name].includes(value)) {
      // Remove it
      setFormData(prevData => ({
        ...prevData,
        [name]: prevData[name].filter(item => item !== value)
      }));
    } else {
      // Add it
      setFormData(prevData => ({
        ...prevData,
        [name]: [...prevData[name], value]
      }));
    }
  };
  
  // Get icon for feature tag
  const getFeatureIcon = (feature, type) => {
    // Return appropriate icon based on feature type
    if (type === 'amenities') {
      switch(feature) {
        case 'WiFi': return '📶';
        case 'AV Equipment': return '🔊';
        case 'Kitchen': return '🍽️';
        case 'Parking': return '🅿️';
        case 'Air Conditioning': return '❄️';
        case 'Heating': return '🔥';
        case 'Natural Light': return '☀️';
        case 'Stage': return '🎭';
        case 'Sound System': return '🎵';
        case 'Projector': return '📽️';
        case 'Tables': return '🪑';
        case 'Chairs': return '🪑';
        case 'Whiteboard': return '📋';
        case 'Bar Area': return '🍸';
        case 'Dance Floor': return '💃';
        case 'Coat Check': return '🧥';
        case 'Outdoor Space': return '🌳';
        default: return '✓';
      }
    } else if (type === 'suitability') {
      switch(feature) {
        case 'Conferences': return '🎤';
        case 'Meetings': return '👥';
        case 'Workshops': return '🛠️';
        case 'Exhibitions': return '🖼️';
        case 'Performances': return '🎭';
        case 'Weddings': return '💍';
        case 'Parties': return '🎉';
        case 'Sports Events': return '🏅';
        case 'Fitness Classes': return '🏋️';
        case 'Presentations': return '📊';
        case 'Corporate Events': return '💼';
        case 'Educational Events': return '🎓';
        default: return '✓';
      }
    } else {
      return '✓';
    }
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.street || !formData.city || !formData.state || !formData.zip_code || !formData.max_capacity) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format data for API
      const venueData = {
        ...formData,
        max_capacity: parseInt(formData.max_capacity)
      };
      
      if (isEditing) {
        // Update existing venue
        await api.updateVenue(id, venueData);
      } else {
        // Create new venue
        await api.createVenue(venueData);
      }
      
      // Redirect to venues list
      navigate('/manage-venues');
    } catch (err) {
      console.error('Error submitting venue:', err);
      setError('Error saving venue. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="page-container">
      <PageHeader 
        title={isEditing ? 'Edit Venue' : 'Add New Venue'} 
        backLink="/manage-venues"
      />
      
      <div className="form-container">
        <div className="form-progress">
          
          <div 
            className={`progress-step ${activeSection === 'basic' ? 'active' : ''} ${activeSection !== 'basic' ? 'completed' : ''}`}
            onClick={() => handleSectionChange('basic')}
          >
            <div className="step-icon">
              <span className="step-check">✓</span>
              <span className="material-icons step-material-icon">info</span>
            </div>
            <span className="step-label">Basic Information</span>
          </div>
          
          <div 
            className={`progress-step ${activeSection === 'location' ? 'active' : ''} ${['capacity', 'pricing', 'features'].includes(activeSection) ? 'completed' : ''}`}
            onClick={() => handleSectionChange('location')}
          >
            <div className="step-icon">
              <span className="step-check">✓</span>
              <span className="material-icons step-material-icon">location_on</span>
            </div>
            <span className="step-label">Location</span>
          </div>
          
          <div 
            className={`progress-step ${activeSection === 'capacity' ? 'active' : ''} ${['pricing', 'features'].includes(activeSection) ? 'completed' : ''}`}
            onClick={() => handleSectionChange('capacity')}
          >
            <div className="step-icon">
              <span className="step-check">✓</span>
              <span className="material-icons step-material-icon">groups</span>
            </div>
            <span className="step-label">Capacity</span>
          </div>
          
          <div 
            className={`progress-step ${activeSection === 'pricing' ? 'active' : ''} ${activeSection === 'features' ? 'completed' : ''}`}
            onClick={() => handleSectionChange('pricing')}
          >
            <div className="step-icon">
              <span className="step-check">✓</span>
              <span className="material-icons step-material-icon">attach_money</span>
            </div>
            <span className="step-label">Pricing</span>
          </div>
          
          <div 
            className={`progress-step ${activeSection === 'features' ? 'active' : ''}`}
            onClick={() => handleSectionChange('features')}
          >
            <div className="step-icon">
              <span className="step-check">✓</span>
              <span className="material-icons step-material-icon">stars</span>
            </div>
            <span className="step-label">Features</span>
          </div>
        </div>
      
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="modern-form">
          {/* Basic Information Section */}
          {activeSection === 'basic' && (
            <div className="form-section-container">
              <div className="form-section-header">
                <h2 className="section-title">
                  <span className="section-icon">🏢</span>
                  Basic Information
                </h2>
                <p className="section-description">
                  Enter the venue's basic details.
                </p>
              </div>
              
              <div className="form-content card">
                <div className="input-grid">
                  <div className="form-group full-width">
                    <label htmlFor="name" className="form-label">Venue Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Queenstown Conference Center"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category" className="form-label">Category *</label>
                    <div className="select-with-icon">
                      <i className="input-icon fas fa-tag"></i>
                      <select
                        id="category"
                        name="category"
                        className="form-control with-icon"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categoryOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="description" className="form-label">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Provide a detailed description of the venue including key features and benefits"
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary next-btn"
                    onClick={() => handleSectionChange('location')}
                  >
                    Next: Location
                    <span className="btn-icon-right">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="form-section-container">
              <div className="form-section-header">
                <h2 className="section-title">
                  <span className="section-icon">📍</span>
                  Location Information
                </h2>
                <p className="section-description">
                  Enter the venue's address details.
                </p>
              </div>
              
              <div className="form-content card">
                <div className="input-grid">
                  <div className="form-group full-width">
                    <label htmlFor="street" className="form-label">Street Address *</label>
                    <div className="input-with-icon">
                      <i className="input-icon fas fa-map-marker-alt"></i>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        className="form-control with-icon"
                        value={formData.street}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 10 Lake Road"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Queenstown"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state" className="form-label">Region *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Otago"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zip_code" className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      id="zip_code"
                      name="zip_code"
                      className="form-control"
                      value={formData.zip_code}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 9300"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="country" className="form-label">Country</label>
                    <div className="select-with-icon">
                      <i className="input-icon fas fa-globe"></i>
                      <select
                        id="country"
                        name="country"
                        className="form-control with-icon"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        <option value="New Zealand">New Zealand</option>
                        <option value="Australia">Australia</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSectionChange('basic')}
                  >
                    <span className="btn-icon-left">←</span>
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary next-btn"
                    onClick={() => handleSectionChange('capacity')}
                  >
                    Next: Capacity
                    <span className="btn-icon-right">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Capacity & Dimensions Section */}
          {activeSection === 'capacity' && (
            <div className="form-section-container">
              <div className="form-section-header">
                <h2 className="section-title">
                  <span className="section-icon">👥</span>
                  Capacity & Dimensions
                </h2>
                <p className="section-description">
                  Specify the venue's capacity and size information.
                </p>
              </div>
              
              <div className="form-content card">
                <div className="input-grid">
                  <div className="form-group">
                    <label htmlFor="min_capacity" className="form-label">Minimum Capacity</label>
                    <div className="input-with-icon">
                      <i className="input-icon fas fa-users"></i>
                      <input
                        type="number"
                        id="min_capacity"
                        name="min_capacity"
                        className="form-control with-icon"
                        value={formData.min_capacity}
                        onChange={handleNumberChange}
                        min="1"
                        placeholder="Minimum recommended capacity"
                      />
                    </div>
                    <small className="form-text text-muted">Minimum recommended number of people</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="max_capacity" className="form-label">Maximum Capacity *</label>
                    <div className="input-with-icon">
                      <i className="input-icon fas fa-users"></i>
                      <input
                        type="number"
                        id="max_capacity"
                        name="max_capacity"
                        className="form-control with-icon"
                        value={formData.max_capacity}
                        onChange={handleNumberChange}
                        min="1"
                        required
                        placeholder="Maximum allowed capacity"
                      />
                    </div>
                    <small className="form-text text-muted">Maximum number of people allowed</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dimensions" className="form-label">Dimensions</label>
                    <div className="input-with-icon">
                      <i className="input-icon fas fa-ruler-combined"></i>
                      <input
                        type="text"
                        id="dimensions"
                        name="dimensions"
                        className="form-control with-icon"
                        value={formData.dimensions}
                        onChange={handleChange}
                        placeholder="e.g. 20m x 15m (300m²)"
                      />
                    </div>
                    <small className="form-text text-muted">Size or dimensions of the venue</small>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSectionChange('location')}
                  >
                    <span className="btn-icon-left">←</span>
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary next-btn"
                    onClick={() => handleSectionChange('pricing')}
                  >
                    Next: Pricing
                    <span className="btn-icon-right">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Pricing & Booking Section */}
          {activeSection === 'pricing' && (
            <div className="form-section-container">
              <div className="form-section-header">
                <h2 className="section-title">
                  <span className="section-icon">💰</span>
                  Pricing & Booking Settings
                </h2>
                <p className="section-description">
                  Set up pricing, deposit requirements, and booking policies.
                </p>
              </div>
              
              <div className="form-content card">
                <div className="form-subsection">
                  <h3 className="subsection-title">Rental Rates</h3>
                  <div className="input-grid">
                    <div className="form-group">
                      <label htmlFor="hourly_rate" className="form-label">Hourly Rate (NZD) *</label>
                      <div className="input-with-icon">
                        <i className="input-icon fas fa-dollar-sign"></i>
                        <input
                          type="number"
                          id="hourly_rate"
                          name="hourly_rate"
                          className="form-control with-icon"
                          value={formData.hourly_rate}
                          onChange={handleNumberChange}
                          min="0"
                          step="0.01"
                          required
                          placeholder="Hourly rental rate"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="daily_rate" className="form-label">Daily Rate (NZD) *</label>
                      <div className="input-with-icon">
                        <i className="input-icon fas fa-dollar-sign"></i>
                        <input
                          type="number"
                          id="daily_rate"
                          name="daily_rate"
                          className="form-control with-icon"
                          value={formData.daily_rate}
                          onChange={handleNumberChange}
                          min="0"
                          step="0.01"
                          required
                          placeholder="Daily rental rate"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Deposit & Insurance</h3>
                  
                  <div className="checkbox-group">
                    <div className="enhanced-checkbox">
                      <input
                        type="checkbox"
                        id="deposit_required"
                        name="deposit_required"
                        checked={formData.deposit_required}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="deposit_required">
                        <span className="checkbox-icon"></span>
                        <span className="checkbox-text">Require Deposit</span>
                      </label>
                    </div>
                    
                    <div className="enhanced-checkbox">
                      <input
                        type="checkbox"
                        id="insurance_required"
                        name="insurance_required"
                        checked={formData.insurance_required}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="insurance_required">
                        <span className="checkbox-icon"></span>
                        <span className="checkbox-text">Require Insurance</span>
                      </label>
                    </div>
                  </div>
                  
                  {formData.deposit_required && (
                    <div className="form-group">
                      <label htmlFor="deposit_amount" className="form-label">Deposit Amount (NZD)</label>
                      <div className="input-with-icon">
                        <i className="input-icon fas fa-dollar-sign"></i>
                        <input
                          type="number"
                          id="deposit_amount"
                          name="deposit_amount"
                          className="form-control with-icon"
                          value={formData.deposit_amount}
                          onChange={handleNumberChange}
                          min="0"
                          step="0.01"
                          placeholder="Required deposit amount"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Setup & Teardown</h3>
                  <div className="input-grid">
                    <div className="form-group">
                      <label htmlFor="setup_time" className="form-label">Setup Time (minutes)</label>
                      <div className="input-with-icon">
                        <i className="input-icon fas fa-clock"></i>
                        <input
                          type="number"
                          id="setup_time"
                          name="setup_time"
                          className="form-control with-icon"
                          value={formData.setup_time}
                          onChange={handleNumberChange}
                          min="0"
                          placeholder="Required setup time before event"
                        />
                      </div>
                      <small className="form-text text-muted">Time needed before bookings for setup</small>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="teardown_time" className="form-label">Teardown Time (minutes)</label>
                      <div className="input-with-icon">
                        <i className="input-icon fas fa-clock"></i>
                        <input
                          type="number"
                          id="teardown_time"
                          name="teardown_time"
                          className="form-control with-icon"
                          value={formData.teardown_time}
                          onChange={handleNumberChange}
                          min="0"
                          placeholder="Required teardown time after event"
                        />
                      </div>
                      <small className="form-text text-muted">Time needed after bookings for teardown</small>
                    </div>
                  </div>
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Policies</h3>
                  <div className="form-group full-width">
                    <label htmlFor="cancellation_policy" className="form-label">Cancellation Policy</label>
                    <textarea
                      id="cancellation_policy"
                      name="cancellation_policy"
                      className="form-control"
                      value={formData.cancellation_policy}
                      onChange={handleChange}
                      rows="2"
                      placeholder="e.g. Full refund if cancelled 48 hours before booking"
                    ></textarea>
                    <small className="form-text text-muted">Describe your cancellation policy</small>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSectionChange('capacity')}
                  >
                    <span className="btn-icon-left">←</span>
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary next-btn"
                    onClick={() => handleSectionChange('features')}
                  >
                    Next: Features
                    <span className="btn-icon-right">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Features & Suitability Section */}
          {activeSection === 'features' && (
            <div className="form-section-container">
              <div className="form-section-header">
                <h2 className="section-title">
                  <span className="section-icon">✨</span>
                  Features & Additional Information
                </h2>
                <p className="section-description">
                  Specify amenities, accessibility features, and venue suitability.
                </p>
              </div>
              
              <div className="form-content card">
                <div className="form-subsection">
                  <h3 className="subsection-title">Amenities</h3>
                  <p className="form-text text-muted">Select all amenities that are available at this venue</p>
                  <div className="feature-tags">
                    {amenityOptions.map(option => (
                      <div 
                        key={option} 
                        className={`feature-tag ${formData.amenities.includes(option) ? 'selected' : ''}`}
                        onClick={() => handleMultiSelectChange('amenities', option)}
                      >
                        <span className="feature-tag-icon">{getFeatureIcon(option, 'amenities')}</span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Accessibility Features</h3>
                  <p className="form-text text-muted">Select all accessibility features available at this venue</p>
                  <div className="horizontal-checkbox-group">
                    {accessibilityOptions.map(option => (
                      <div key={option} className="form-check">
                        <input
                          type="checkbox"
                          id={`accessibility-${option}`}
                          className="form-check-input"
                          checked={formData.accessibility_features.includes(option)}
                          onChange={() => handleMultiSelectChange('accessibility_features', option)}
                        />
                        <label htmlFor={`accessibility-${option}`} className="form-check-label">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Venue Suitable For</h3>
                  <p className="form-text text-muted">Select all event types this venue is suitable for</p>
                  <div className="feature-tags">
                    {suitabilityOptions.map(option => (
                      <div 
                        key={option} 
                        className={`feature-tag ${formData.suitability.includes(option) ? 'selected' : ''}`}
                        onClick={() => handleMultiSelectChange('suitability', option)}
                      >
                        <span className="feature-tag-icon">{getFeatureIcon(option, 'suitability')}</span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Restrictions</h3>
                  <p className="form-text text-muted">Select any restrictions that apply to this venue</p>
                  <div className="horizontal-checkbox-group">
                    {restrictionOptions.map(option => (
                      <div key={option} className="form-check">
                        <input
                          type="checkbox"
                          id={`restriction-${option}`}
                          className="form-check-input"
                          checked={formData.restrictions.includes(option)}
                          onChange={() => handleMultiSelectChange('restrictions', option)}
                        />
                        <label htmlFor={`restriction-${option}`} className="form-check-label">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Additional Notes</h3>
                  <div className="form-group full-width">
                    <label htmlFor="additional_notes" className="form-label">Notes</label>
                    <textarea
                      id="additional_notes"
                      name="additional_notes"
                      className="form-control"
                      value={formData.additional_notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Any other important details about the venue"
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSectionChange('pricing')}
                  >
                    <span className="btn-icon-left">←</span>
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success submit-btn"
                    disabled={isSubmitting}
                  >
                    <span className="btn-icon">✓</span>
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Venue' : 'Save Venue'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VenueForm;