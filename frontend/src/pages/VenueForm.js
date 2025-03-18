import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const VenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'New Zealand', // Default to New Zealand since we're using QLDC
    max_capacity: '',
    min_capacity: '',
    dimensions: '',
    hourly_rate: '',
    daily_rate: '',
    setup_time: 60, // Default setup time in minutes
    teardown_time: 60, // Default teardown time in minutes
    availability: {
      monday: { start: '08:00', end: '22:00', available: true },
      tuesday: { start: '08:00', end: '22:00', available: true },
      wednesday: { start: '08:00', end: '22:00', available: true },
      thursday: { start: '08:00', end: '22:00', available: true },
      friday: { start: '08:00', end: '22:00', available: true },
      saturday: { start: '09:00', end: '22:00', available: true },
      sunday: { start: '09:00', end: '22:00', available: true }
    },
    amenities: [],
    accessibility_features: [],
    suitability: [], // What the venue is suitable for
    restrictions: [], // Any restrictions
    insurance_required: false,
    deposit_required: false,
    deposit_amount: '',
    cancellation_policy: '',
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
  const amenityOptions = ['WiFi', 'AV Equipment', 'Kitchen', 'Parking', 'Accessible Entrance', 'Air Conditioning', 'Heating', 'Natural Light', 'Stage', 'Sound System', 'Projector', 'Tables', 'Chairs', 'Whiteboard', 'Bar Area', 'Dance Floor', 'Coat Check', 'Outdoor Space'];
  const accessibilityOptions = ['Wheelchair Access', 'Accessible Restrooms', 'Accessible Parking', 'Hearing Loop', 'Elevator', 'Ramp', 'Braille Signage', 'Service Animal Friendly'];
  
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
        name: venue.name || '',
        description: venue.description || '',
        category: venue.category || '',
        street: venue.street || '',
        city: venue.city || '',
        state: venue.state || '',
        zip_code: venue.zip_code || '',
        country: venue.country || 'New Zealand',
        max_capacity: venue.max_capacity || '',
        min_capacity: venue.min_capacity || '',
        dimensions: venue.dimensions || '',
        hourly_rate: venue.hourly_rate || '',
        daily_rate: venue.daily_rate || '',
        setup_time: venue.setup_time || 60,
        teardown_time: venue.teardown_time || 60,
        availability: venue.availability || {
          monday: { start: '08:00', end: '22:00', available: true },
          tuesday: { start: '08:00', end: '22:00', available: true },
          wednesday: { start: '08:00', end: '22:00', available: true },
          thursday: { start: '08:00', end: '22:00', available: true },
          friday: { start: '08:00', end: '22:00', available: true },
          saturday: { start: '09:00', end: '22:00', available: true },
          sunday: { start: '09:00', end: '22:00', available: true }
        },
        amenities: venue.amenities || [],
        accessibility_features: venue.accessibility_features || [],
        suitability: venue.suitability || [],
        restrictions: venue.restrictions || [],
        insurance_required: venue.insurance_required || false,
        deposit_required: venue.deposit_required || false,
        deposit_amount: venue.deposit_amount || '',
        cancellation_policy: venue.cancellation_policy || '',
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
  
  // Access restriction removed to allow all users to add/edit venues
  
  if (loading) {
    return <div className="loading">Loading venue data...</div>;
  }
  
  return (
    <div className="venue-form-page">
      <div className="container">
        <div className="page-header">
          <h1>{isEditing ? 'Edit Venue' : 'Add New Venue'}</h1>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="venue-form compact-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="name">Venue Name <span className="required">*</span></label>
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
              
              <div className="form-group col-md-6">
                <label htmlFor="category">Category <span className="required">*</span></label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
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
            
            <div className="form-group">
              <label htmlFor="description">Description <span className="required">*</span></label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Provide a detailed description of the venue including key features and benefits"
                required
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Location</h2>
            <div className="form-group">
              <label htmlFor="street">Street Address <span className="required">*</span></label>
              <input
                type="text"
                id="street"
                name="street"
                className="form-control"
                value={formData.street}
                onChange={handleChange}
                required
                placeholder="e.g. 10 Lake Road"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group col-md-5">
                <label htmlFor="city">City <span className="required">*</span></label>
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
              
              <div className="form-group col-md-4">
                <label htmlFor="state">Region <span className="required">*</span></label>
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
              
              <div className="form-group col-md-3">
                <label htmlFor="zip_code">Postal Code <span className="required">*</span></label>
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
            </div>
          </div>
          
          <div className="form-section">
            <h2>Capacity & Dimensions</h2>
            <div className="form-row">
              <div className="form-group col-md-4">
                <label htmlFor="min_capacity">Minimum Capacity</label>
                <input
                  type="number"
                  id="min_capacity"
                  name="min_capacity"
                  className="form-control"
                  value={formData.min_capacity}
                  onChange={handleNumberChange}
                  min="1"
                  placeholder="Minimum recommended capacity"
                />
              </div>
              
              <div className="form-group col-md-4">
                <label htmlFor="max_capacity">Maximum Capacity <span className="required">*</span></label>
                <input
                  type="number"
                  id="max_capacity"
                  name="max_capacity"
                  className="form-control"
                  value={formData.max_capacity}
                  onChange={handleNumberChange}
                  min="1"
                  required
                  placeholder="Maximum allowed capacity"
                />
              </div>

              <div className="form-group col-md-4">
                <label htmlFor="dimensions">Dimensions</label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  className="form-control"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g. 20m x 15m (300m²)"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing</h2>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="hourly_rate">Hourly Rate (NZD) <span className="required">*</span></label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    id="hourly_rate"
                    name="hourly_rate"
                    className="form-control"
                    value={formData.hourly_rate}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="Hourly rental rate"
                  />
                </div>
              </div>
              
              <div className="form-group col-md-6">
                <label htmlFor="daily_rate">Daily Rate (NZD) <span className="required">*</span></label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    id="daily_rate"
                    name="daily_rate"
                    className="form-control"
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
            
            <div className="form-row">
              <div className="form-group col-md-6">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="deposit_required"
                    name="deposit_required"
                    className="form-check-input"
                    checked={formData.deposit_required}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="deposit_required" className="form-check-label">
                    Deposit Required
                  </label>
                </div>
              </div>
              
              {formData.deposit_required && (
                <div className="form-group col-md-6">
                  <label htmlFor="deposit_amount">Deposit Amount (NZD)</label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">$</span>
                    </div>
                    <input
                      type="number"
                      id="deposit_amount"
                      name="deposit_amount"
                      className="form-control"
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
          </div>

          <div className="form-section">
            <h2>Booking Settings</h2>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="setup_time">Setup Time (minutes)</label>
                <input
                  type="number"
                  id="setup_time"
                  name="setup_time"
                  className="form-control"
                  value={formData.setup_time}
                  onChange={handleNumberChange}
                  min="0"
                  placeholder="Required setup time before event"
                />
                <small className="form-text text-muted">Amount of time needed before bookings for setup</small>
              </div>
              
              <div className="form-group col-md-6">
                <label htmlFor="teardown_time">Teardown Time (minutes)</label>
                <input
                  type="number"
                  id="teardown_time"
                  name="teardown_time"
                  className="form-control"
                  value={formData.teardown_time}
                  onChange={handleNumberChange}
                  min="0"
                  placeholder="Required teardown time after event"
                />
                <small className="form-text text-muted">Amount of time needed after bookings for teardown</small>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="cancellation_policy">Cancellation Policy</label>
              <textarea
                id="cancellation_policy"
                name="cancellation_policy"
                className="form-control"
                value={formData.cancellation_policy}
                onChange={handleChange}
                rows="2"
                placeholder="e.g. Full refund if cancelled 48 hours before booking"
              ></textarea>
            </div>
            
            <div className="form-check mb-3">
              <input
                type="checkbox"
                id="insurance_required"
                name="insurance_required"
                className="form-check-input"
                checked={formData.insurance_required}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="insurance_required" className="form-check-label">
                Insurance Required for Booking
              </label>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Features & Suitability</h2>
            
            {/* Amenities - Tag-based UI */}
            <div className="form-group">
              <label>Amenities</label>
              <p className="form-text text-muted">Select all amenities that are available at this venue</p>
              <div className="feature-tags">
                <div className="feature-tag-group-title">Available Amenities</div>
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
            
            {/* Accessibility - Horizontal checkbox layout */}
            <div className="form-group">
              <label>Accessibility Features</label>
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
            
            {/* Suitable For - Tag-based UI */}
            <div className="form-group">
              <label>Venue Suitable For</label>
              <p className="form-text text-muted">Select all event types this venue is suitable for</p>
              <div className="feature-tags">
                <div className="feature-tag-group-title">Event Types</div>
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
            
            {/* Restrictions - Horizontal checkbox layout */}
            <div className="form-group">
              <label>Restrictions</label>
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
          </div>
          
          <div className="form-section">
            <h2>Additional Information</h2>
            <div className="form-group">
              <label htmlFor="additional_notes">Additional Notes</label>
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
              className="btn btn-secondary"
              onClick={() => navigate('/manage-venues')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Venue' : 'Create Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenueForm;