import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';

// Simple standalone loading spinner for the booking page
const BookingLoadingSpinner = ({ color = '#4f46e5' }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    width: '100%'
  }}>
    <div style={{ 
      border: '4px solid #f3f3f3',
      borderTop: `4px solid ${color}`, 
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const BookingPage = ({ standalone = false }) => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('businessId') || 'default';
  
  // Business info - in a real implementation, this would be fetched based on businessId
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Venue Booking',
    primaryColor: '#2563eb',
    description: 'Book community venues for your next event'
  });
  
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookingConfig, setBookingConfig] = useState({
    title: 'Book a Venue',
    subtitle: 'Find and book the perfect venue for your event',
    confirmationMessage: 'Your venue booking has been confirmed. You will receive a confirmation email shortly.'
  });
  
  const [formData, setFormData] = useState({
    venueId: '',
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    duration: 2, // Default duration in hours
    attendees: '',
    eventType: '',
    notes: '',
  });

  // Load business info and venues
  useEffect(() => {
    const fetchData = async () => {
      try {
        // DEMO VENUES for testing
        const DEMO_VENUES = [
          {
            _id: 'venue-1',
            title: 'Queenstown Memorial Hall',
            description: 'Large community hall with stage and seating for up to 400 people. Perfect for performances, conferences, and large gatherings.',
            price: { amount: 150.00, currency: 'NZD' },
            minDuration: 1,
            maxDuration: 12,
            capacity: 400,
            location: 'Queenstown CBD',
            features: ['Stage', 'Sound System', 'Projector', 'Kitchen', 'Wheelchair Access'],
            imageUrl: 'https://placehold.co/400x300?text=Memorial+Hall'
          },
          {
            _id: 'venue-2',
            title: 'Lake Hayes Pavilion',
            description: 'Scenic venue with lake views, ideal for weddings, celebrations and community events. Includes outdoor area.',
            price: { amount: 120.00, currency: 'NZD' },
            minDuration: 2,
            maxDuration: 24,
            capacity: 150,
            location: 'Lake Hayes',
            features: ['Lake Views', 'Kitchen', 'Outdoor Area', 'Tables & Chairs', 'Parking'],
            imageUrl: 'https://placehold.co/400x300?text=Lake+Hayes'
          },
          {
            _id: 'venue-3',
            title: 'Arrowtown Community Centre',
            description: 'Charming venue in historic Arrowtown suitable for meetings, small events and classes.',
            price: { amount: 80.00, currency: 'NZD' },
            minDuration: 1,
            maxDuration: 8,
            capacity: 100,
            location: 'Arrowtown',
            features: ['Meeting Rooms', 'Kitchen', 'Projector', 'Whiteboard', 'Wifi'],
            imageUrl: 'https://placehold.co/400x300?text=Arrowtown+Centre'
          },
          {
            _id: 'venue-4',
            title: 'Wanaka Recreation Centre',
            description: 'Modern sports facility with various rooms and spaces for sports events, classes, and community activities.',
            price: { amount: 100.00, currency: 'NZD' },
            minDuration: 1,
            maxDuration: 10,
            capacity: 300,
            location: 'Wanaka',
            features: ['Sports Hall', 'Meeting Rooms', 'AV Equipment', 'Changing Rooms', 'Parking'],
            imageUrl: 'https://placehold.co/400x300?text=Wanaka+Centre'
          }
        ];
        
        // Set demo venues
        setVenues(DEMO_VENUES);
        setFilteredVenues(DEMO_VENUES);
        
        // Simulate booking page configuration loading
        // In a real app, this would be: const configResponse = await api.getBookingPageConfig(businessId);
        
        // Parse URL params for config in demo mode
        const title = searchParams.get('title') || 'Book a Venue';
        const subtitle = searchParams.get('subtitle') || 'Find and book the perfect venue for your event';
        const primaryColor = searchParams.get('color') || '#2563eb';
        
        // Update business info
        setBusinessInfo(prev => ({
          ...prev,
          primaryColor: primaryColor
        }));
        
        // Update booking config
        setBookingConfig({
          title: decodeURIComponent(title),
          subtitle: decodeURIComponent(subtitle),
          confirmationMessage: 'Your venue booking has been confirmed. You will receive a confirmation email shortly.'
        });
        
        // Generate demo time slots for today
        generateDemoTimeSlots();
        
      } catch (error) {
        console.error('Error fetching booking data:', error);
        toast.error('Could not load venues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Generate demo time slots for a given date
    const generateDemoTimeSlots = () => {
      const slots = [];
      const startHour = 8; // 8 AM
      const endHour = 20; // 8 PM
      
      for (let hour = startHour; hour <= endHour; hour++) {
        // Random availability (70% chance of being available)
        const isAvailable = Math.random() > 0.3;
        if (isAvailable) {
          slots.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            available: true
          });
          // Add half-hour slot
          if (hour < endHour) {
            slots.push({
              time: `${hour.toString().padStart(2, '0')}:30`,
              available: Math.random() > 0.3
            });
          }
        }
      }
      
      setAvailableTimeSlots(slots);
    };

    fetchData();
  }, [businessId]);
  
  // Filter venues based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVenues(venues);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = venues.filter(venue => 
      venue.title.toLowerCase().includes(query) || 
      venue.description.toLowerCase().includes(query) ||
      venue.location.toLowerCase().includes(query) ||
      venue.features.some(feature => feature.toLowerCase().includes(query))
    );
    
    setFilteredVenues(filtered);
  }, [searchQuery, venues]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // When date changes, generate new available slots
    if (name === 'date') {
      // In a real app, this would fetch from the backend
      // For demo, we'll just generate random slots
      const slots = [];
      const startHour = 8; // 8 AM
      const endHour = 20; // 8 PM
      
      for (let hour = startHour; hour <= endHour; hour++) {
        // Random availability (70% chance of being available)
        const isAvailable = Math.random() > 0.3;
        if (isAvailable) {
          slots.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            available: true
          });
          // Add half-hour slot
          if (hour < endHour) {
            slots.push({
              time: `${hour.toString().padStart(2, '0')}:30`,
              available: Math.random() > 0.3
            });
          }
        }
      }
      
      setAvailableTimeSlots(slots);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const selectVenue = (venueId) => {
    const venue = venues.find(v => v._id === venueId);
    setFormData(prev => ({ 
      ...prev, 
      venueId,
      duration: venue?.minDuration || 2
    }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.venueId) {
      toast.error('Please select a venue to continue');
      return;
    }
    
    if (step === 2 && (!formData.name || !formData.email)) {
      toast.error('Please provide your name and email');
      return;
    }
    
    if (step === 3 && (!formData.date || !formData.time)) {
      toast.error('Please select a date and time for your booking');
      return;
    }
    
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Format date and time for API
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const venue = venues.find(v => v._id === formData.venueId);
      const durationHours = formData.duration || 2; // Default to 2 hours
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
      
      // First create or get customer
      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      
      const customerResponse = await api.createOrUpdateCustomer(customerData);
      const customerId = customerResponse.data.customer?._id;
      
      if (!customerId) {
        throw new Error('Failed to create customer record');
      }
      
      // Create the booking
      const bookingData = {
        venueId: formData.venueId,
        client: customerId,
        businessId: businessId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        eventType: formData.eventType,
        expectedAttendees: formData.attendees,
        notes: {
          client: formData.notes,
        },
        status: 'pending',
        source: 'booking_page'
      };
      
      await api.createBooking(bookingData);
      
      // Move to success screen
      setStep(4);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.error || 'Failed to book venue');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <BookingLoadingSpinner color={businessInfo.primaryColor} />;
  }

  // If standalone mode, use the complete page with header
  if (standalone) {
    return (
      <div className="standalone-booking-page" style={{
        fontFamily: 'sans-serif',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}>
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Header Banner */}
        <div style={{
          backgroundColor: businessInfo.primaryColor,
          padding: '20px 0',
          color: 'white',
          textAlign: 'center',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '600' }}>
            {businessInfo.name}
          </h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
            {businessInfo.description}
          </p>
        </div>
        
        <div className="booking-page-container" style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px',
          fontFamily: 'sans-serif'
        }}>
          <div className="booking-header" style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{ 
              color: '#374151', 
              fontSize: '24px',
              marginBottom: '10px',
              fontWeight: '600'
            }}>{bookingConfig.title}</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              {bookingConfig.subtitle}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="booking-progress" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '30px'
          }}>
            {[1, 2, 3].map(stepNum => (
              <div 
                key={stepNum}
                style={{
                  width: '70px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: step >= stepNum ? businessInfo.primaryColor : '#e5e7eb',
                  color: step >= stepNum ? '#fff' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  margin: '0 auto 10px'
                }}>
                  {stepNum}
                </div>
                <div style={{ fontSize: '14px' }}>
                  {stepNum === 1 ? 'Venue' : stepNum === 2 ? 'Information' : 'Schedule'}
                </div>
              </div>
            ))}
          </div>

          <div className="booking-card" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '30px'
          }}>
            {/* Step 1: Venue Selection */}
            {step === 1 && (
              <div className="booking-step">
                <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Find a Venue</h2>
                
                {/* Search Box */}
                <div className="search-box" style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Search venues by name, location, or features..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div className="venues-list-container" style={{ 
                  marginBottom: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '5px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div className="venues-list" style={{ 
                    maxHeight: '500px',
                    overflowY: 'auto',
                    paddingRight: '5px',
                    paddingLeft: '5px'
                  }}>
                    {filteredVenues.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center' }}>
                        <p>No venues match your search. Please try different keywords.</p>
                      </div>
                    ) : (
                      filteredVenues.map(venue => (
                        <div 
                          key={venue._id}
                          className="venue-item"
                          style={{
                            padding: '20px',
                            marginBottom: '15px',
                            border: `2px solid ${formData.venueId === venue._id ? businessInfo.primaryColor : '#e5e7eb'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: formData.venueId === venue._id ? `${businessInfo.primaryColor}15` : '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          onClick={() => selectVenue(venue._id)}
                        >
                          <div style={{ 
                            display: 'flex', 
                            gap: '15px',
                            flexWrap: 'nowrap' 
                          }}>
                            {venue.imageUrl && (
                              <div style={{ 
                                minWidth: '120px',
                                maxWidth: '120px'
                              }}>
                                <img 
                                  src={venue.imageUrl} 
                                  alt={venue.title}
                                  style={{ 
                                    width: '120px', 
                                    height: '90px', 
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                  }}
                                />
                              </div>
                            )}
                            <div style={{ 
                              flex: '1 1 auto',
                              minWidth: 0 // Required for text truncation to work
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                flexWrap: 'wrap'
                              }}>
                                <h3 style={{ 
                                  margin: '0 0 5px 0', 
                                  fontSize: '18px',
                                  fontWeight: '600',
                                  color: '#111827'
                                }}>{venue.title}</h3>
                                <span style={{ 
                                  fontWeight: 'bold', 
                                  color: businessInfo.primaryColor,
                                  whiteSpace: 'nowrap',
                                  marginLeft: '8px'
                                }}>
                                  ${venue.price?.amount || 0}/{venue.price?.currency} per hour
                                </span>
                              </div>
                              <p style={{ 
                                margin: '5px 0 10px', 
                                fontSize: '14px', 
                                color: '#4b5563',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {venue.description}
                              </p>
                              <div style={{ 
                                fontSize: '14px', 
                                color: '#6b7280',
                                display: 'flex',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{ 
                                  display: 'inline-block', 
                                  marginRight: '15px',
                                  marginBottom: '4px'
                                }}>
                                  <strong>Location:</strong> {venue.location}
                                </span>
                                <span style={{ display: 'inline-block' }}>
                                  <strong>Capacity:</strong> {venue.capacity} people
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="venue-features" style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '6px'
                          }}>
                            {venue.features.map((feature, index) => (
                              <span 
                                key={index}
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#f3f4f6',
                                  padding: '4px 10px',
                                  borderRadius: '16px',
                                  fontSize: '12px',
                                  color: '#4b5563',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="booking-actions" style={{ marginTop: '30px' }}>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.venueId || filteredVenues.length === 0}
                    style={{
                      backgroundColor: businessInfo.primaryColor,
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '16px',
                      fontWeight: '500',
                      opacity: (!formData.venueId || filteredVenues.length === 0) ? 0.6 : 1
                    }}
                  >
                    Continue to Your Information
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Customer Information */}
            {step === 2 && (
              <div className="booking-step">
                <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Your Information</h2>
                
                <div className="venue-selected-info" style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Selected Venue</h3>
                  <p style={{ margin: '0', fontSize: '15px' }}>
                    <strong>{venues.find(v => v._id === formData.venueId)?.title}</strong>
                  </p>
                </div>
                
                <div className="form-row" style={{ 
                  display: 'flex', 
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name *</label>
                    <input 
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email *</label>
                    <input 
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Your email address"
                    />
                  </div>
                </div>
                
                <div className="form-row" style={{ 
                  display: 'flex', 
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number</label>
                    <input 
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="attendees" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Expected Attendees</label>
                    <input 
                      type="number"
                      id="attendees"
                      name="attendees"
                      value={formData.attendees}
                      onChange={handleInputChange}
                      min="1"
                      max={venues.find(v => v._id === formData.venueId)?.capacity}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Number of attendees"
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="eventType" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Event Type</label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">-- Select Event Type --</option>
                    <option value="conference">Conference</option>
                    <option value="wedding">Wedding</option>
                    <option value="meeting">Meeting</option>
                    <option value="cultural">Cultural Event</option>
                    <option value="sports">Sports Event</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="workshop">Workshop</option>
                    <option value="social">Social Gathering</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="booking-actions" style={{ 
                  marginTop: '30px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <button 
                    onClick={prevStep}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '48%',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.name || !formData.email}
                    style={{
                      backgroundColor: businessInfo.primaryColor,
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '48%',
                      fontSize: '16px',
                      fontWeight: '500',
                      opacity: (!formData.name || !formData.email) ? 0.6 : 1
                    }}
                  >
                    Continue to Schedule
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time Selection */}
            {step === 3 && (
              <div className="booking-step">
                <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Choose Date & Time</h2>
                
                <div className="venue-selected-info" style={{ 
                  backgroundColor: '#f9fafb', 
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Selected Venue</h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '15px' }}>
                    <strong>{venues.find(v => v._id === formData.venueId)?.title}</strong>
                  </p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                    {venues.find(v => v._id === formData.venueId)?.location}
                  </p>
                </div>
                
                <div className="form-row" style={{ 
                  display: 'flex', 
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="date" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date *</label>
                    <input 
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="duration" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Duration (hours)</label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white'
                      }}
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'hour' : 'hours'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {formData.date && (
                  <div className="time-slots" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Available Time Slots *</label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                      gap: '10px',
                      margin: '10px 0'
                    }}>
                      {availableTimeSlots.map((slot, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '8px 0',
                            textAlign: 'center',
                            border: `1px solid ${formData.time === slot.time ? businessInfo.primaryColor : '#d1d5db'}`,
                            borderRadius: '4px',
                            backgroundColor: formData.time === slot.time ? `${businessInfo.primaryColor}15` : 'white',
                            cursor: 'pointer',
                            fontWeight: formData.time === slot.time ? 'bold' : 'normal'
                          }}
                          onClick={() => setFormData(prev => ({ ...prev, time: slot.time }))}
                        >
                          {slot.time}
                        </div>
                      ))}
                    </div>
                    {availableTimeSlots.length === 0 && formData.date && (
                      <p style={{ color: '#ef4444', fontSize: '14px' }}>No time slots available on this date. Please select another date.</p>
                    )}
                  </div>
                )}
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="notes" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Additional Requirements</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                    placeholder="Any special requirements, equipment needs, or additional information..."
                  />
                </div>

                <div className="booking-actions" style={{ 
                  marginTop: '30px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <button 
                    onClick={prevStep}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '48%',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!formData.date || !formData.time || submitting || availableTimeSlots.length === 0}
                    style={{
                      backgroundColor: businessInfo.primaryColor,
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '48%',
                      fontSize: '16px',
                      fontWeight: '500',
                      opacity: (!formData.date || !formData.time || submitting || availableTimeSlots.length === 0) ? 0.6 : 1
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Book Venue'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="booking-step confirmation" style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  margin: '0 auto 25px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
                
                <h2 style={{ color: '#111827', marginBottom: '15px', fontSize: '24px' }}>Venue Booked Successfully!</h2>
                <p style={{ marginBottom: '25px', color: '#4b5563', fontSize: '16px' }}>
                  {bookingConfig.confirmationMessage}
                </p>
                
                <div className="booking-summary" style={{
                  backgroundColor: '#f3f4f6',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '25px',
                  textAlign: 'left'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>Booking Summary</h3>
                  <p style={{ marginBottom: '10px' }}><strong>Venue:</strong> {venues.find(v => v._id === formData.venueId)?.title}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Location:</strong> {venues.find(v => v._id === formData.venueId)?.location}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Date:</strong> {formData.date ? new Date(formData.date).toLocaleDateString() : 'N/A'}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Time:</strong> {formData.time}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Duration:</strong> {formData.duration} hours</p>
                  {formData.eventType && (
                    <p style={{ marginBottom: '10px' }}><strong>Event Type:</strong> {formData.eventType}</p>
                  )}
                  {formData.attendees && (
                    <p style={{ marginBottom: '10px' }}><strong>Attendees:</strong> {formData.attendees}</p>
                  )}
                  <p style={{ marginBottom: '0' }}><strong>Booked By:</strong> {formData.name}</p>
                </div>
                
                <button 
                  onClick={() => {
                    // Reset form and go back to step 1
                    setFormData({
                      venueId: '',
                      name: '',
                      email: '',
                      phone: '',
                      date: '',
                      time: '',
                      duration: 2,
                      attendees: '',
                      eventType: '',
                      notes: '',
                    });
                    setStep(1);
                  }}
                  style={{
                    backgroundColor: businessInfo.primaryColor,
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  Book Another Venue
                </button>
              </div>
            )}
          </div>

          <div className="booking-footer" style={{
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
          </div>
        </div>
      </div>
    );
  }

  // Non-standalone version (for integration within main app)
  return (
    <div className="page-container">
      <div className="card">
        <div className="card-body">
          <h2>Book a Venue</h2>
          <p>Use the venue booking system to find and reserve suitable spaces for your events.</p>
          {/* Booking form elements would go here in a more integrated version */}
          <p>For the full booking experience, please use the standalone booking page.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;