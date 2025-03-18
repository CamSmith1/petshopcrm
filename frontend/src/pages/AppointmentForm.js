import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

const AppointmentForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const isEditing = appointmentId && appointmentId !== 'new';
  
  const [loading, setLoading] = useState(isEditing);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const searchContainerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    customerId: '',
    customerName: '',
    date: '',
    time: '09:00', // Default to 9:00 AM
    duration: 60,
    notes: '',
  });

  useEffect(() => {
    // Fetch services, customers, and venues data
    const fetchFormData = async () => {
      try {
        // Fetch venues
        const venuesResponse = await api.getVenues();
        setVenues(venuesResponse.data.venues || []);
        
        // Fetch services
        const servicesResponse = await api.getServices();
        setServices(servicesResponse.data.services || []);
        
        // Fetch customers (using mock data for now)
        const customersData = [
          { _id: 'cust1', name: 'John Smith', email: 'john@example.com', phone: '555-123-4567' },
          { _id: 'cust2', name: 'Mary Johnson', email: 'mary@example.com', phone: '555-234-5678' },
          { _id: 'cust3', name: 'David Williams', email: 'david@example.com', phone: '555-345-6789' },
          { _id: 'cust4', name: 'Sarah Miller', email: 'sarah@example.com', phone: '555-456-7890' },
          { _id: 'cust5', name: 'James Brown', email: 'james@example.com', phone: '555-567-8901' },
          { _id: 'cust6', name: 'Jennifer Davis', email: 'jennifer@example.com', phone: '555-678-9012' },
          { _id: 'cust7', name: 'Michael Wilson', email: 'michael@example.com', phone: '555-789-0123' },
          { _id: 'cust8', name: 'Linda Martinez', email: 'linda@example.com', phone: '555-890-1234' },
          { _id: 'cust9', name: 'Robert Taylor', email: 'robert@example.com', phone: '555-901-2345' },
          { _id: 'cust10', name: 'Elizabeth Anderson', email: 'elizabeth@example.com', phone: '555-012-3456' },
        ];
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        
        // If editing, fetch appointment data
        if (isEditing) {
          const appointmentResponse = await api.getBooking(appointmentId);
          const appointment = appointmentResponse.data.booking;
          
          // Set customer
          if (appointment.client?._id) {
            setSelectedCustomer(appointment.client._id);
            setSearchTerm(appointment.client?.name || '');
          }
          
          // Format the date and time
          const appointmentDate = new Date(appointment.startTime);
          const formattedDate = appointmentDate.toISOString().split('T')[0];
          const formattedTime = appointmentDate.toTimeString().slice(0, 5);
          
          // Calculate duration in minutes
          const endTime = new Date(appointment.endTime);
          const durationMinutes = Math.round((endTime - appointmentDate) / 60000);
          
          // Set selected venue if it exists
          if (appointment.location) {
            setSelectedVenue(appointment.location);
            // Fetch venue availability
            await fetchVenueAvailability(appointment.location);
          }
          
          setFormData({
            serviceId: appointment.service?._id || '',
            customerId: appointment.client?._id || '',
            date: formattedDate,
            time: formattedTime,
            duration: durationMinutes,
            notes: appointment.notes?.client || '',
            location: appointment.location || '',
          });
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [appointmentId, isEditing]);
  
  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }
    
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = customers.filter(customer => {
      return (
        customer.name.toLowerCase().includes(lowercasedFilter) ||
        customer.email.toLowerCase().includes(lowercasedFilter) ||
        customer.phone.toLowerCase().includes(lowercasedFilter)
      );
    });
    
    setFilteredCustomers(filtered);
    setShowDropdown(true);
  }, [searchTerm, customers]);
  
  // Update customer selection
  useEffect(() => {
    if (selectedCustomer) {
      const customer = customers.find(c => c._id === selectedCustomer);
      setFormData(prev => ({
        ...prev,
        customerId: selectedCustomer,
        customerName: customer ? customer.name : '',
      }));
    }
  }, [selectedCustomer, customers]);
  
  // Fetch venue availability when a venue is selected
  const fetchVenueAvailability = async (venueId) => {
    try {
      // Get current date
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(today.getMonth() + 2); // Look ahead 2 months
      
      // Get venue availability
      const availabilityResponse = await api.getVenueAvailability(venueId, {
        startDate: today.toISOString(),
        endDate: endDate.toISOString()
      });
      
      // Get bookings for this venue
      const bookingsResponse = await api.getBookings({
        location: venueId,
        startDate: today.toISOString(),
        endDate: endDate.toISOString()
      });
      
      // Extract booked dates
      const bookings = bookingsResponse.data.bookings || [];
      const bookedDates = bookings.map(booking => {
        const date = new Date(booking.startTime);
        return date.toISOString().split('T')[0];
      });
      
      // Generate available dates (for demo purposes, we'll create a range of dates)
      const availableDatesList = [];
      const daysToGenerate = 60; // Generate 60 days
      
      for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Skip dates that are already booked
        if (!bookedDates.includes(dateStr)) {
          availableDatesList.push({
            date: dateStr,
            formatted: new Date(dateStr).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })
          });
        }
      }
      
      setAvailableDates(availableDatesList);
    } catch (error) {
      console.error('Error fetching venue availability:', error);
      toast.error('Failed to load venue availability');
    }
  };
  
  // Handle venue selection
  useEffect(() => {
    if (selectedVenue) {
      fetchVenueAvailability(selectedVenue);
      
      // Update the form data with the selected venue
      setFormData(prev => ({
        ...prev,
        location: selectedVenue
      }));
    }
  }, [selectedVenue]);
  
  // Handle new customer submission
  const handleNewCustomerSubmit = async () => {
    // Validate form
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      // Create new customer
      const response = await api.createOrUpdateCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone
      });
      
      const createdCustomer = response.data.customer;
      
      // Add to customers list
      setCustomers([...customers, createdCustomer]);
      
      // Select the new customer
      setSelectedCustomer(createdCustomer._id);
      setSearchTerm(createdCustomer.name);
      
      // Close modal
      setShowNewCustomerModal(false);
      
      // Reset form
      setNewCustomer({
        name: '',
        email: '',
        phone: ''
      });
      
      toast.success('Customer created successfully');
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  };
  
  // Handle new customer input changes
  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleCustomerSearch = (e) => {
    setSearchTerm(e.target.value);
    setFormData({
      ...formData,
      customerName: e.target.value,
      customerId: '',
    });
  };
  
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer._id);
    setSearchTerm(customer.name);
    setFormData({
      ...formData,
      customerId: customer._id,
      customerName: customer.name,
    });
    setShowDropdown(false);
  };
  
  const handleCreateNewCustomer = () => {
    // Set the new customer's name to the search term
    setNewCustomer({
      ...newCustomer,
      name: searchTerm
    });
    setShowNewCustomerModal(true);
    setShowDropdown(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate if a customer is selected
    if (!formData.customerId) {
      toast.error('Please select a customer from the search results');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format date and time for API
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(startTime.getTime() + formData.duration * 60000);
      
      // Find selected customer and service details for richer data storage
      const selectedCustomer = customers.find(cust => cust._id === formData.customerId) || {};
      const selectedService = services.find(svc => svc._id === formData.serviceId) || {};
      
      const appointmentData = {
        service: {
          _id: formData.serviceId,
          title: selectedService.title || 'Unknown Service'
        },
        client: {
          _id: formData.customerId,
          name: selectedCustomer.name || 'Unknown Customer',
          email: selectedCustomer.email || ''
        },
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: {
          client: formData.notes,
        },
        status: 'pending',
        location: 'In-store'
      };
      
      // Create or update appointment
      if (isEditing) {
        await api.updateBooking(appointmentId, appointmentData);
        toast.success('Appointment updated successfully');
      } else {
        await api.createBooking(appointmentData);
        toast.success('Appointment created successfully');
      }
      
      // Navigate back to appointments list
      navigate('/appointments');
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };
  
  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };
  
  // Add event listener for clicking outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <div className="page-container">
        <PageHeader 
          title={isEditing ? 'Edit Booking' : 'New Booking'} 
          backLink="/bookings"
        />
        
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="location">Venue</label>
                <select
                  id="location" 
                  name="location" 
                  className="form-control"
                  value={formData.location || ''}
                  onChange={(e) => {
                    handleInputChange(e);
                    setSelectedVenue(e.target.value);
                  }}
                  required
                >
                  <option value="">Select a venue</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="customerSearch">Customer</label>
                <div className="customer-search-container" ref={searchContainerRef} style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id="customerSearch"
                    name="customerSearch"
                    className="form-control"
                    placeholder="Search by name, email, or phone"
                    value={searchTerm}
                    onChange={handleCustomerSearch}
                    onFocus={() => setShowDropdown(true)}
                    autoComplete="off"
                    required
                  />
                  {showDropdown && (
                    <div className="customer-search-results" style={{
                      position: 'absolute',
                      width: '100%',
                      maxHeight: '200px',
                      overflow: 'auto',
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderTop: 'none',
                      zIndex: 10,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                          <div
                            key={customer._id}
                            className="customer-search-item"
                            onClick={() => handleSelectCustomer(customer)}
                            style={{
                              padding: '8px 15px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #eee',
                              borderLeft: `3px solid ${customer._id === selectedCustomer ? '#4a90e2' : 'transparent'}`,
                              backgroundColor: customer._id === selectedCustomer ? '#f0f7ff' : 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = customer._id === selectedCustomer ? '#f0f7ff' : 'transparent'}
                          >
                            <div style={{ fontWeight: 'bold' }}>{customer.name}</div>
                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                              {customer.email} • {customer.phone}
                            </div>
                          </div>
                        ))
                      ) : (
                        searchTerm.trim() !== '' && (
                          <div
                            className="create-new-customer"
                            onClick={handleCreateNewCustomer}
                            style={{
                              padding: '12px 15px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #eee',
                              backgroundColor: '#f8f9fa',
                              color: '#0d6efd',
                              textAlign: 'center',
                              fontWeight: 'bold'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          >
                            <i className="fas fa-plus-circle" style={{ marginRight: '8px' }}></i>
                            Create new customer: "{searchTerm}"
                          </div>
                        )
                      )}
                    </div>
                  )}
                  {/* Hidden input to store the customer ID for form submission */}
                  <input
                    type="hidden"
                    name="customerId"
                    value={formData.customerId}
                  />
                </div>
              </div>
              
              {selectedVenue && (
                <div className="form-group">
                  <label>Available Dates</label>
                  <div className="available-dates-container" style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    {availableDates.length > 0 ? (
                      availableDates.slice(0, 14).map(dateObj => (
                        <div
                          key={dateObj.date}
                          className={`date-option ${formData.date === dateObj.date ? 'selected' : ''}`}
                          onClick={() => setFormData({...formData, date: dateObj.date})}
                          style={{
                            padding: '8px 12px',
                            border: formData.date === dateObj.date ? '2px solid #4a90e2' : '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: formData.date === dateObj.date ? '#f0f7ff' : '#fff',
                            minWidth: '90px',
                            textAlign: 'center'
                          }}
                        >
                          {dateObj.formatted}
                        </div>
                      ))
                    ) : (
                      <div className="no-dates-available" style={{
                        padding: '15px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderRadius: '4px',
                        width: '100%',
                        textAlign: 'center'
                      }}>
                        No available dates for this venue
                      </div>
                    )}
                  </div>
                  {availableDates.length > 14 && (
                    <div style={{ textAlign: 'center', marginTop: '-5px', marginBottom: '15px' }}>
                      <button
                        type="button"
                        className="btn btn-link"
                        style={{ padding: '0', fontSize: '0.9rem' }}
                        onClick={() => {/* Show more dates logic */}}
                      >
                        Show more dates...
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {formData.date && (
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="time">Time</label>
                    <div className="time-picker-container">
                      <select
                        id="time"
                        name="time"
                        className="form-control"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          appearance: 'menulist',
                          backgroundImage: 'none',
                          paddingRight: '8px'
                        }}
                      >
                        {/* Morning slots */}
                        <optgroup label="Morning">
                          <option value="08:00">8:00 AM</option>
                          <option value="08:30">8:30 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="09:30">9:30 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="10:30">10:30 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="11:30">11:30 AM</option>
                        </optgroup>
                        {/* Afternoon slots */}
                        <optgroup label="Afternoon">
                          <option value="12:00">12:00 PM</option>
                          <option value="12:30">12:30 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="13:30">1:30 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="14:30">2:30 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="15:30">3:30 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="16:30">4:30 PM</option>
                          <option value="17:00">5:00 PM</option>
                          <option value="17:30">5:30 PM</option>
                        </optgroup>
                        {/* Evening slots */}
                        <optgroup label="Evening">
                          <option value="18:00">6:00 PM</option>
                          <option value="18:30">6:30 PM</option>
                          <option value="19:00">7:00 PM</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <select
                  id="duration" 
                  name="duration" 
                  className="form-control"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                >
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="300">5 hours</option>
                  <option value="360">6 hours</option>
                  <option value="480">8 hours (Full day)</option>
                  <option value="720">12 hours</option>
                  <option value="1440">24 hours (Overnight)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea 
                  id="notes" 
                  name="notes" 
                  className="form-control"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Add any special requirements, setup instructions, or equipment needs"
                ></textarea>
              </div>
              
              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/bookings')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Booking' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {showNewCustomerModal && (
        <div className="modal" style={{
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000
        }}>
          <div className="modal-dialog" style={{
            margin: '60px auto',
            maxWidth: '500px'
          }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Customer</h5>
                <button type="button" className="close" onClick={() => setShowNewCustomerModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group mb-3">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={newCustomer.name}
                      onChange={handleNewCustomerChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={newCustomer.email}
                      onChange={handleNewCustomerChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={newCustomer.phone}
                      onChange={handleNewCustomerChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewCustomerModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNewCustomerSubmit}>
                  Create Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentForm;