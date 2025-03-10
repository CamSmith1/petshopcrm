import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CustomerForm = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!customerId;
  const [loading, setLoading] = useState(isEditing);
  const [activeSection, setActiveSection] = useState('basic');
  
  const [formData, setFormData] = useState({
    // Basic information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Address
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Preferences
    preferredContactMethod: 'email',
    preferredAppointmentDay: '',
    preferredAppointmentTime: '',
    receiveMarketingEmails: true,
    sendAppointmentReminders: true,

    // Notes
    notes: ''
  });
  
  useEffect(() => {
    if (isEditing) {
      // In a real app, this would fetch customer data from API
      // Simulating API request with setTimeout
      setTimeout(() => {
        setFormData({
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '(555) 123-4567',
          
          streetAddress: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
          country: 'United States',
          
          preferredContactMethod: 'email',
          preferredAppointmentDay: 'Tuesday',
          preferredAppointmentTime: 'afternoon',
          receiveMarketingEmails: true,
          sendAppointmentReminders: true,
          
          notes: 'Prefers afternoon appointments. Always pays promptly.'
        });
        setLoading(false);
      }, 800);
    }
  }, [isEditing, customerId]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, this would send data to API
      // Simulating API request with setTimeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(isEditing 
        ? 'Customer updated successfully!' 
        : 'Customer added successfully!'
      );
      
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer information');
    } finally {
      setLoading(false);
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
        title={isEditing ? 'Edit Customer' : 'Add New Customer'} 
        backLink="/customers"
      />
      
      <div className="form-container">
        <div className="form-progress">
          <div className="progress-line"></div>
          <div 
            className={`progress-step ${activeSection === 'basic' ? 'active' : ''} ${activeSection === 'address' || activeSection === 'preferences' ? 'completed' : ''}`}
            onClick={() => handleSectionChange('basic')}
          >
            <div className="step-icon">
              <span className="step-number">1</span>
              <span className="step-check">✓</span>
            </div>
            <span className="step-label">Basic Information</span>
          </div>
          
          <div 
            className={`progress-step ${activeSection === 'address' ? 'active' : ''} ${activeSection === 'preferences' ? 'completed' : ''}`}
            onClick={() => handleSectionChange('address')}
          >
            <div className="step-icon">
              <span className="step-number">2</span>
              <span className="step-check">✓</span>
            </div>
            <span className="step-label">Address</span>
          </div>
          
          <div 
            className={`progress-step ${activeSection === 'preferences' ? 'active' : ''}`}
            onClick={() => handleSectionChange('preferences')}
          >
            <div className="step-icon">
              <span className="step-number">3</span>
              <span className="step-check">✓</span>
            </div>
            <span className="step-label">Preferences</span>
          </div>
        </div>
      
        <form onSubmit={handleSubmit} className="modern-form">
          {activeSection === 'basic' && (
            <div className="form-section-container">
              <div className="form-section-header">
                <h2 className="section-title">
                  <span className="section-icon">👤</span>
                  Basic Information
                </h2>
                <p className="section-description">
                  Enter the customer's contact information.
                </p>
              </div>
              
              <div className="form-content card">
                <div className="input-grid">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-control"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-control"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <div className="input-with-icon">
                      <i className="input-icon fas fa-envelope"></i>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control with-icon"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number *</label>
                    <div className="input-with-icon">
                      <i className="input-icon fas fa-phone"></i>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control with-icon"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary next-btn"
                    onClick={() => handleSectionChange('address')}
                  >
                    Next: Address
                    <span className="btn-icon-right">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'address' && (
            <div className="form-section-container">
              <div className="form-section-header">
                <h2 className="section-title">
                  <span className="section-icon">🏠</span>
                  Address Information
                </h2>
                <p className="section-description">
                  Enter the customer's address details.
                </p>
              </div>
              
              <div className="form-content card">
                <div className="input-grid">
                  <div className="form-group full-width">
                    <label htmlFor="streetAddress" className="form-label">Street Address</label>
                    <div className="input-with-icon">
                      <i className="input-icon fas fa-map-marker-alt"></i>
                      <input
                        type="text"
                        id="streetAddress"
                        name="streetAddress"
                        className="form-control with-icon"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        placeholder="Enter street address"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state" className="form-label">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state or province"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zipCode" className="form-label">Zip/Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      className="form-control"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter zip or postal code"
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
                        onChange={handleInputChange}
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
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
                    onClick={() => handleSectionChange('preferences')}
                  >
                    Next: Preferences
                    <span className="btn-icon-right">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'preferences' && (
            <div className="form-section-container">
              <div className="form-section-header">
                <h2 className="section-title">
                  <span className="section-icon">⚙️</span>
                  Preferences & Notes
                </h2>
                <p className="section-description">
                  Set customer preferences and add additional notes.
                </p>
              </div>
              
              <div className="form-content card">
                <div className="form-subsection">
                  <h3 className="subsection-title">Communication Preferences</h3>
                  
                  <div className="form-group">
                    <label htmlFor="preferredContactMethod" className="form-label">Preferred Contact Method</label>
                    <div className="select-with-icon">
                      <i className="input-icon fas fa-comment-alt"></i>
                      <select
                        id="preferredContactMethod"
                        name="preferredContactMethod"
                        className="form-control with-icon"
                        value={formData.preferredContactMethod}
                        onChange={handleInputChange}
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="checkbox-group">
                    <div className="enhanced-checkbox">
                      <input
                        type="checkbox"
                        id="receiveMarketingEmails"
                        name="receiveMarketingEmails"
                        checked={formData.receiveMarketingEmails}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="receiveMarketingEmails">
                        <span className="checkbox-icon"></span>
                        <span className="checkbox-text">Receive promotional emails</span>
                      </label>
                    </div>
                    
                    <div className="enhanced-checkbox">
                      <input
                        type="checkbox"
                        id="sendAppointmentReminders"
                        name="sendAppointmentReminders"
                        checked={formData.sendAppointmentReminders}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="sendAppointmentReminders">
                        <span className="checkbox-icon"></span>
                        <span className="checkbox-text">Send appointment reminders</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Appointment Preferences</h3>
                  
                  <div className="input-row">
                    <div className="form-group">
                      <label htmlFor="preferredAppointmentDay" className="form-label">Preferred Day</label>
                      <div className="select-with-icon">
                        <i className="input-icon fas fa-calendar-day"></i>
                        <select
                          id="preferredAppointmentDay"
                          name="preferredAppointmentDay"
                          className="form-control with-icon"
                          value={formData.preferredAppointmentDay}
                          onChange={handleInputChange}
                        >
                          <option value="">No preference</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="preferredAppointmentTime" className="form-label">Preferred Time</label>
                      <div className="select-with-icon">
                        <i className="input-icon fas fa-clock"></i>
                        <select
                          id="preferredAppointmentTime"
                          name="preferredAppointmentTime"
                          className="form-control with-icon"
                          value={formData.preferredAppointmentTime}
                          onChange={handleInputChange}
                        >
                          <option value="">No preference</option>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="form-subsection">
                  <h3 className="subsection-title">Additional Notes</h3>
                  
                  <div className="form-group full-width">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <div className="textarea-with-icon">
                      <i className="input-icon fas fa-sticky-note"></i>
                      <textarea
                        id="notes"
                        name="notes"
                        className="form-control with-icon"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Enter any additional information about this customer..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleSectionChange('address')}
                  >
                    <span className="btn-icon-left">←</span>
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success submit-btn"
                  >
                    <span className="btn-icon">✓</span>
                    {isEditing ? 'Update Customer' : 'Save Customer'}
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

export default CustomerForm;