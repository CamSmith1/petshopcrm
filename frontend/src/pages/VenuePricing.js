import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const VenuePricing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venue, setVenue] = useState(null);
  const [layouts, setLayouts] = useState([]);
  const [pricingTiers, setPricingTiers] = useState([]);
  
  // Form state for adding/editing pricing tiers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPricingId, setCurrentPricingId] = useState(null);
  const [formData, setFormData] = useState({
    layout_id: '',
    tier_name: '',
    price_amount: '',
    price_currency: 'USD',
    price_unit: 'hour',
    minimum_hours: '1'
  });
  
  // Load venue, layouts, and pricing data
  useEffect(() => {
    fetchVenueData();
  }, [id]);
  
  const fetchVenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch venue details
      const venueResponse = await api.getVenue(id);
      setVenue(venueResponse.data.venue);
      
      // Fetch layouts
      const layoutsResponse = await api.getVenueLayouts(id);
      setLayouts(layoutsResponse.data.layouts || []);
      
      // Fetch pricing tiers
      // In a real app, you'd have a dedicated endpoint for this
      // For now, we're mocking this data
      setPricingTiers([
        {
          id: '1',
          venue_id: id,
          layout_id: layoutsResponse.data.layouts?.[0]?.id,
          tier_name: 'standard',
          price_amount: 150.00,
          price_currency: 'USD',
          price_unit: 'hour',
          minimum_hours: 1
        },
        {
          id: '2',
          venue_id: id,
          layout_id: layoutsResponse.data.layouts?.[0]?.id,
          tier_name: 'commercial',
          price_amount: 200.00,
          price_currency: 'USD',
          price_unit: 'hour',
          minimum_hours: 2
        },
        {
          id: '3',
          venue_id: id,
          layout_id: layoutsResponse.data.layouts?.[0]?.id,
          tier_name: 'community',
          price_amount: 100.00,
          price_currency: 'USD',
          price_unit: 'hour',
          minimum_hours: 1
        }
      ]);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching venue data:', err);
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
    if (value === '' || parseFloat(value) >= 0) {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };
  
  // Open form for adding new pricing tier
  const handleAddPricing = () => {
    const defaultLayoutId = layouts.length > 0 ? layouts[0].id : '';
    
    setFormData({
      layout_id: defaultLayoutId,
      tier_name: '',
      price_amount: '',
      price_currency: 'USD',
      price_unit: 'hour',
      minimum_hours: '1'
    });
    setIsEditing(false);
    setCurrentPricingId(null);
    setIsFormOpen(true);
  };
  
  // Open form for editing pricing tier
  const handleEditPricing = (pricing) => {
    setFormData({
      layout_id: pricing.layout_id || '',
      tier_name: pricing.tier_name || '',
      price_amount: pricing.price_amount.toString() || '',
      price_currency: pricing.price_currency || 'USD',
      price_unit: pricing.price_unit || 'hour',
      minimum_hours: pricing.minimum_hours.toString() || '1'
    });
    setIsEditing(true);
    setCurrentPricingId(pricing.id);
    setIsFormOpen(true);
  };
  
  // Close form
  const handleCancelForm = () => {
    setIsFormOpen(false);
  };
  
  // Submit form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.layout_id || !formData.tier_name || !formData.price_amount || !formData.price_unit) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      const pricingData = {
        ...formData,
        price_amount: parseFloat(formData.price_amount),
        minimum_hours: parseInt(formData.minimum_hours) || 1
      };
      
      if (isEditing) {
        // Mock update existing pricing tier
        setPricingTiers(prev => prev.map(p => 
          p.id === currentPricingId ? { ...p, ...pricingData } : p
        ));
      } else {
        // Mock create new pricing tier
        const newPricing = {
          id: Math.random().toString(36).substring(2, 9),
          venue_id: id,
          ...pricingData
        };
        setPricingTiers(prev => [...prev, newPricing]);
      }
      
      // Close form
      setIsFormOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error saving pricing tier:', err);
      setError('Error saving pricing tier. Please try again.');
    }
  };
  
  // Delete pricing tier
  const handleDeletePricing = async (pricingId) => {
    if (!window.confirm('Are you sure you want to delete this pricing tier? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Mock delete pricing tier
      setPricingTiers(prev => prev.filter(p => p.id !== pricingId));
    } catch (err) {
      console.error('Error deleting pricing tier:', err);
      setError('Error deleting pricing tier. Please try again.');
    }
  };
  
  // Access restriction removed to allow all users to manage pricing
  
  if (loading) {
    return <div className="loading">Loading venue pricing...</div>;
  }
  
  if (!venue) {
    return <div className="error-message">Venue not found.</div>;
  }
  
  return (
    <div className="venue-pricing-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Manage Pricing - {venue.name}</h1>
            <Link to="/manage-venues" className="btn btn-link">
              Back to Venues
            </Link>
          </div>
          
          <button className="btn btn-primary" onClick={handleAddPricing}>
            Add New Pricing Tier
          </button>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {/* Pricing Form */}
        {isFormOpen && (
          <div className="pricing-form-container">
            <h2>{isEditing ? 'Edit Pricing Tier' : 'Add New Pricing Tier'}</h2>
            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label htmlFor="layout_id">Layout <span className="required">*</span></label>
                <select
                  id="layout_id"
                  name="layout_id"
                  className="form-control"
                  value={formData.layout_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a layout</option>
                  {layouts.map(layout => (
                    <option key={layout.id} value={layout.id}>
                      {layout.name} (Capacity: {layout.capacity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="tier_name">Pricing Tier <span className="required">*</span></label>
                <select
                  id="tier_name"
                  name="tier_name"
                  className="form-control"
                  value={formData.tier_name}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a pricing tier</option>
                  <option value="standard">Standard</option>
                  <option value="commercial">Commercial</option>
                  <option value="community">Community</option>
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="price_amount">Price <span className="required">*</span></label>
                  <input
                    type="number"
                    id="price_amount"
                    name="price_amount"
                    className="form-control"
                    value={formData.price_amount}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group col-md-6">
                  <label htmlFor="price_currency">Currency</label>
                  <select
                    id="price_currency"
                    name="price_currency"
                    className="form-control"
                    value={formData.price_currency}
                    onChange={handleChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="price_unit">Price Unit <span className="required">*</span></label>
                  <select
                    id="price_unit"
                    name="price_unit"
                    className="form-control"
                    value={formData.price_unit}
                    onChange={handleChange}
                    required
                  >
                    <option value="hour">Per Hour</option>
                    <option value="day">Per Day</option>
                    <option value="event">Per Event</option>
                  </select>
                </div>
                
                <div className="form-group col-md-6">
                  <label htmlFor="minimum_hours">Minimum Hours/Days</label>
                  <input
                    type="number"
                    id="minimum_hours"
                    name="minimum_hours"
                    className="form-control"
                    value={formData.minimum_hours}
                    onChange={handleNumberChange}
                    min="1"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditing ? 'Update Pricing' : 'Add Pricing'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Pricing Tiers List */}
        {pricingTiers.length === 0 ? (
          <div className="no-pricing">
            <p>No pricing tiers have been added for this venue yet.</p>
            <p>Add pricing tiers to specify different rates for different customer types and layouts.</p>
          </div>
        ) : (
          <div className="pricing-list">
            {pricingTiers.map(pricing => {
              const layoutName = layouts.find(l => l.id === pricing.layout_id)?.name || 'Unknown Layout';
              
              return (
                <div key={pricing.id} className="pricing-card">
                  <div className="pricing-info">
                    <h3>
                      {pricing.tier_name.charAt(0).toUpperCase() + pricing.tier_name.slice(1)} - {layoutName}
                    </h3>
                    <p className="price">
                      <span className="amount">{pricing.price_currency} {pricing.price_amount.toFixed(2)}</span>
                      <span className="unit">
                        {pricing.price_unit === 'hour' ? 'per hour' : 
                         pricing.price_unit === 'day' ? 'per day' : 'per event'}
                      </span>
                    </p>
                    <p className="minimum">
                      Minimum booking: {pricing.minimum_hours} {pricing.price_unit === 'hour' ? 'hour' : 'day'}
                      {pricing.minimum_hours !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="pricing-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditPricing(pricing)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeletePricing(pricing.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenuePricing;