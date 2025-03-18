import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const VenueLayouts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venue, setVenue] = useState(null);
  const [layouts, setLayouts] = useState([]);
  
  // Form state for adding/editing layouts
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLayoutId, setCurrentLayoutId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    setup_notes: '',
    floor_plan_url: ''
  });
  
  // Load venue and layouts data
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
    if (value === '' || parseInt(value) >= 0) {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };
  
  // Open form for adding new layout
  const handleAddLayout = () => {
    setFormData({
      name: '',
      description: '',
      capacity: '',
      setup_notes: '',
      floor_plan_url: ''
    });
    setIsEditing(false);
    setCurrentLayoutId(null);
    setIsFormOpen(true);
  };
  
  // Open form for editing layout
  const handleEditLayout = (layout) => {
    setFormData({
      name: layout.name || '',
      description: layout.description || '',
      capacity: layout.capacity || '',
      setup_notes: layout.setup_notes || '',
      floor_plan_url: layout.floor_plan_url || ''
    });
    setIsEditing(true);
    setCurrentLayoutId(layout.id);
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
    if (!formData.name || !formData.capacity) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      const layoutData = {
        ...formData,
        capacity: parseInt(formData.capacity)
      };
      
      if (isEditing) {
        // Update existing layout
        await api.updateVenueLayout(id, currentLayoutId, layoutData);
      } else {
        // Create new layout
        await api.createVenueLayout(id, layoutData);
      }
      
      // Refresh layouts
      const layoutsResponse = await api.getVenueLayouts(id);
      setLayouts(layoutsResponse.data.layouts || []);
      
      // Close form
      setIsFormOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error saving layout:', err);
      setError('Error saving layout. Please try again.');
    }
  };
  
  // Delete layout
  const handleDeleteLayout = async (layoutId) => {
    if (!window.confirm('Are you sure you want to delete this layout? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteVenueLayout(id, layoutId);
      
      // Update local state
      setLayouts(layouts.filter(layout => layout.id !== layoutId));
    } catch (err) {
      console.error('Error deleting layout:', err);
      setError('Error deleting layout. Please try again.');
    }
  };
  
  // Access restriction removed to allow all users to manage layouts
  
  if (loading) {
    return <div className="loading">Loading venue layouts...</div>;
  }
  
  if (!venue) {
    return <div className="error-message">Venue not found.</div>;
  }
  
  return (
    <div className="venue-layouts-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>Manage Layouts - {venue.name}</h1>
            <Link to="/manage-venues" className="btn btn-link">
              Back to Venues
            </Link>
          </div>
          
          <button className="btn btn-primary" onClick={handleAddLayout}>
            Add New Layout
          </button>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {/* Layout Form */}
        {isFormOpen && (
          <div className="layout-form-container">
            <h2>{isEditing ? 'Edit Layout' : 'Add New Layout'}</h2>
            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label htmlFor="name">Layout Name <span className="required">*</span></label>
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
                <label htmlFor="capacity">Capacity <span className="required">*</span></label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  className="form-control"
                  value={formData.capacity}
                  onChange={handleNumberChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="setup_notes">Setup Notes</label>
                <textarea
                  id="setup_notes"
                  name="setup_notes"
                  className="form-control"
                  value={formData.setup_notes}
                  onChange={handleChange}
                  rows="2"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="floor_plan_url">Floor Plan URL</label>
                <input
                  type="text"
                  id="floor_plan_url"
                  name="floor_plan_url"
                  className="form-control"
                  value={formData.floor_plan_url}
                  onChange={handleChange}
                />
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
                  {isEditing ? 'Update Layout' : 'Add Layout'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Layouts List */}
        {layouts.length === 0 ? (
          <div className="no-layouts">
            <p>No layouts have been added for this venue yet.</p>
            <p>Add layouts to specify different room configurations and their capacities.</p>
          </div>
        ) : (
          <div className="layouts-list">
            {layouts.map(layout => (
              <div key={layout.id} className="layout-card">
                <div className="layout-info">
                  <h3>{layout.name}</h3>
                  {layout.description && <p>{layout.description}</p>}
                  <p><strong>Capacity:</strong> {layout.capacity} people</p>
                  {layout.setup_notes && (
                    <p><strong>Setup Notes:</strong> {layout.setup_notes}</p>
                  )}
                  {layout.floor_plan_url && (
                    <div className="floor-plan">
                      <p><strong>Floor Plan:</strong></p>
                      <a href={layout.floor_plan_url} target="_blank" rel="noopener noreferrer">
                        View Floor Plan
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="layout-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEditLayout(layout)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteLayout(layout.id)}
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

export default VenueLayouts;