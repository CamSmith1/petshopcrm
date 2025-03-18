import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const VenueBonds = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venue, setVenue] = useState(null);
  const [bonds, setBonds] = useState([]);
  
  // Form state for adding/editing bonds
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBondId, setCurrentBondId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'USD',
    is_refundable: true
  });
  
  // Load venue and bonds data
  useEffect(() => {
    fetchVenueData();
  }, [id]);
  
  const fetchVenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch venue details
      const venueResponse = await api.getVenue(id);
      setVenue(venueResponse.data.venue);
      
      // Fetch bonds
      const bondsResponse = await api.getVenueBonds(id);
      setBonds(bondsResponse.data.bonds || []);
      
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
  
  // Open form for adding new bond
  const handleAddBond = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      currency: 'USD',
      is_refundable: true
    });
    setIsEditing(false);
    setCurrentBondId(null);
    setIsFormOpen(true);
  };
  
  // Open form for editing bond
  const handleEditBond = (bond) => {
    setFormData({
      name: bond.name || '',
      description: bond.description || '',
      amount: bond.amount.toString() || '',
      currency: bond.currency || 'USD',
      is_refundable: bond.is_refundable !== undefined ? bond.is_refundable : true
    });
    setIsEditing(true);
    setCurrentBondId(bond.id);
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
    if (!formData.name || !formData.amount) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      const bondData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      if (isEditing) {
        // Update existing bond
        await api.updateVenueBond(id, currentBondId, bondData);
      } else {
        // Create new bond
        await api.createVenueBond(id, bondData);
      }
      
      // Refresh bonds
      const bondsResponse = await api.getVenueBonds(id);
      setBonds(bondsResponse.data.bonds || []);
      
      // Close form
      setIsFormOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error saving bond:', err);
      setError('Error saving bond. Please try again.');
    }
  };
  
  // Delete bond
  const handleDeleteBond = async (bondId) => {
    if (!window.confirm('Are you sure you want to delete this bond? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteVenueBond(id, bondId);
      
      // Update local state
      setBonds(bonds.filter(bond => bond.id !== bondId));
    } catch (err) {
      console.error('Error deleting bond:', err);
      setError('Error deleting bond. Please try again.');
    }
  };
  
  // Access restriction removed to allow all users to manage bonds
  
  if (loading) {
    return <div className="loading">Loading venue bonds...</div>;
  }
  
  if (!venue) {
    return <div className="error-message">Venue not found.</div>;
  }
  
  return (
    <div className="venue-bonds-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Manage Bonds - {venue.name}</h1>
            <Link to="/manage-venues" className="btn btn-link">
              Back to Venues
            </Link>
          </div>
          
          <button className="btn btn-primary" onClick={handleAddBond}>
            Add New Bond
          </button>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {/* Bond Form */}
        {isFormOpen && (
          <div className="bond-form-container">
            <h2>{isEditing ? 'Edit Bond' : 'Add New Bond'}</h2>
            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label htmlFor="name">Bond Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Security Deposit, Cleaning Bond"
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
                  placeholder="Explain the purpose of this bond and the conditions for refund"
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="amount">Amount <span className="required">*</span></label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    className="form-control"
                    value={formData.amount}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group col-md-6">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    className="form-control"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
              
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="is_refundable"
                  name="is_refundable"
                  className="form-check-input"
                  checked={formData.is_refundable}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="is_refundable" className="form-check-label">
                  Refundable Bond
                </label>
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
                  {isEditing ? 'Update Bond' : 'Add Bond'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Bonds List */}
        {bonds.length === 0 ? (
          <div className="no-bonds">
            <p>No bonds have been added for this venue yet.</p>
            <p>Add bonds to protect your venue and equipment during rentals.</p>
          </div>
        ) : (
          <div className="bonds-list">
            {bonds.map(bond => (
              <div key={bond.id} className="bond-card">
                <div className="bond-info">
                  <h3>{bond.name}</h3>
                  {bond.description && <p>{bond.description}</p>}
                  <p className="bond-amount">
                    <strong>Amount:</strong> {bond.currency} {parseFloat(bond.amount).toFixed(2)}
                  </p>
                  <p className="refund-status">
                    {bond.is_refundable ? 'Refundable' : 'Non-refundable'}
                  </p>
                </div>
                
                <div className="bond-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEditBond(bond)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteBond(bond.id)}
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

export default VenueBonds;