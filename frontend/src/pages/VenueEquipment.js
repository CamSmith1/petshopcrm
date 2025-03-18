import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const VenueEquipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venue, setVenue] = useState(null);
  const [equipment, setEquipment] = useState([]);
  
  // Form state for adding/editing equipment
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEquipmentId, setCurrentEquipmentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '1',
    price_amount: '0.00',
    price_currency: 'USD',
    is_included: true
  });
  
  // Load venue and equipment data
  useEffect(() => {
    fetchVenueData();
  }, [id]);
  
  const fetchVenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch venue details
      const venueResponse = await api.getVenue(id);
      setVenue(venueResponse.data.venue);
      
      // Fetch equipment
      const equipmentResponse = await api.getVenueEquipment(id);
      setEquipment(equipmentResponse.data.equipment || []);
      
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
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked
    }));
  };
  
  // Open form for adding new equipment
  const handleAddEquipment = () => {
    setFormData({
      name: '',
      description: '',
      quantity: '1',
      price_amount: '0.00',
      price_currency: 'USD',
      is_included: true
    });
    setIsEditing(false);
    setCurrentEquipmentId(null);
    setIsFormOpen(true);
  };
  
  // Open form for editing equipment
  const handleEditEquipment = (equipment) => {
    setFormData({
      name: equipment.name || '',
      description: equipment.description || '',
      quantity: equipment.quantity.toString() || '1',
      price_amount: equipment.price_amount.toString() || '0.00',
      price_currency: equipment.price_currency || 'USD',
      is_included: equipment.is_included !== undefined ? equipment.is_included : true
    });
    setIsEditing(true);
    setCurrentEquipmentId(equipment.id);
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
    if (!formData.name || !formData.quantity) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      const equipmentData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price_amount: parseFloat(formData.price_amount)
      };
      
      if (isEditing) {
        // Update existing equipment
        await api.updateVenueEquipment(id, currentEquipmentId, equipmentData);
      } else {
        // Create new equipment
        await api.createVenueEquipment(id, equipmentData);
      }
      
      // Refresh equipment
      const equipmentResponse = await api.getVenueEquipment(id);
      setEquipment(equipmentResponse.data.equipment || []);
      
      // Close form
      setIsFormOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error saving equipment:', err);
      setError('Error saving equipment. Please try again.');
    }
  };
  
  // Delete equipment
  const handleDeleteEquipment = async (equipmentId) => {
    if (!window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteVenueEquipment(id, equipmentId);
      
      // Update local state
      setEquipment(equipment.filter(item => item.id !== equipmentId));
    } catch (err) {
      console.error('Error deleting equipment:', err);
      setError('Error deleting equipment. Please try again.');
    }
  };
  
  // Access restriction removed to allow all users to manage equipment
  
  if (loading) {
    return <div className="loading">Loading venue equipment...</div>;
  }
  
  if (!venue) {
    return <div className="error-message">Venue not found.</div>;
  }
  
  return (
    <div className="venue-equipment-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Manage Equipment - {venue.name}</h1>
            <Link to="/manage-venues" className="btn btn-link">
              Back to Venues
            </Link>
          </div>
          
          <button className="btn btn-primary" onClick={handleAddEquipment}>
            Add New Equipment
          </button>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {/* Equipment Form */}
        {isFormOpen && (
          <div className="equipment-form-container">
            <h2>{isEditing ? 'Edit Equipment' : 'Add New Equipment'}</h2>
            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label htmlFor="name">Equipment Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantity Available <span className="required">*</span></label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="form-control"
                  value={formData.quantity}
                  onChange={handleNumberChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="is_included"
                  name="is_included"
                  className="form-check-input"
                  checked={formData.is_included}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="is_included" className="form-check-label">
                  Included in venue rental (no extra charge)
                </label>
              </div>
              
              {!formData.is_included && (
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="price_amount">Price</label>
                    <input
                      type="number"
                      id="price_amount"
                      name="price_amount"
                      className="form-control"
                      value={formData.price_amount}
                      onChange={handleNumberChange}
                      min="0"
                      step="0.01"
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
              )}
              
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
                  {isEditing ? 'Update Equipment' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Equipment List */}
        {equipment.length === 0 ? (
          <div className="no-equipment">
            <p>No equipment has been added for this venue yet.</p>
            <p>Add equipment to let clients know what's available with your venue.</p>
          </div>
        ) : (
          <div className="equipment-list">
            {equipment.map(item => (
              <div key={item.id} className="equipment-card">
                <div className="equipment-info">
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  <p><strong>Quantity Available:</strong> {item.quantity}</p>
                  
                  {item.is_included ? (
                    <p className="included-badge">Included with venue</p>
                  ) : (
                    <p className="price-info">
                      <strong>Additional Price:</strong> {item.price_currency} {parseFloat(item.price_amount).toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="equipment-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEditEquipment(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteEquipment(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueEquipment;