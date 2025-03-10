import React, { useState, useEffect } from 'react';
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
    name: 'Pawsome Dog Services',
    logoUrl: 'https://placehold.co/200x100?text=Dog+Services',
    primaryColor: '#4f46e5',
    description: 'Professional dog care services for your furry friend'
  });
  
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingConfig, setBookingConfig] = useState({
    title: 'Book an Appointment',
    subtitle: 'Follow the steps below to schedule your service',
    confirmationMessage: 'Your appointment has been scheduled. You will receive a confirmation email shortly.'
  });
  
  const [formData, setFormData] = useState({
    serviceId: '',
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: '',
  });

  // Load business info and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        // DEMO SERVICES for testing
        const DEMO_SERVICES = [
          {
            _id: 'service-1',
            title: 'Basic Dog Grooming',
            description: 'Complete grooming service including bath, brush, nail trim, ear cleaning, and basic haircut.',
            price: { amount: 45.00, currency: 'USD' },
            duration: 60
          },
          {
            _id: 'service-2',
            title: 'Deluxe Dog Grooming',
            description: 'Premium grooming package with specialized shampoo, conditioner, teeth brushing, and styled haircut.',
            price: { amount: 65.00, currency: 'USD' },
            duration: 90
          },
          {
            _id: 'service-3',
            title: 'Dog Walking - 30 min',
            description: 'A 30-minute walk for your dog with personalized attention and exercise.',
            price: { amount: 25.00, currency: 'USD' },
            duration: 30
          },
          {
            _id: 'service-4',
            title: 'Dog Training Session',
            description: 'One-hour training session focusing on basic commands, leash training, and behavior correction.',
            price: { amount: 75.00, currency: 'USD' },
            duration: 60
          }
        ];
        
        // Set demo services
        setServices(DEMO_SERVICES);
        
        // Simulate booking page configuration loading
        // In a real app, this would be: const configResponse = await api.getBookingPageConfig(businessId);
        
        // Parse URL params for config in demo mode
        const title = searchParams.get('title') || 'Book an Appointment';
        const subtitle = searchParams.get('subtitle') || 'Follow the steps below to schedule your service';
        const primaryColor = searchParams.get('color') || '#4f46e5';
        
        // Update business info
        setBusinessInfo(prev => ({
          ...prev,
          primaryColor: primaryColor
        }));
        
        // Update booking config
        setBookingConfig({
          title: decodeURIComponent(title),
          subtitle: decodeURIComponent(subtitle),
          confirmationMessage: 'Your appointment has been scheduled. You will receive a confirmation email shortly.'
        });
        
        // Filter services if needed (from URL params)
        const enabledServicesParam = searchParams.get('services');
        if (enabledServicesParam) {
          const enabledServices = enabledServicesParam.split(',');
          setServices(DEMO_SERVICES.filter(service => 
            enabledServices.includes(service._id)
          ));
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
        toast.error('Could not load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.serviceId) {
      toast.error('Please select a service to continue');
      return;
    }
    
    if (step === 2 && (!formData.name || !formData.email)) {
      toast.error('Please provide your name and email');
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
      const service = services.find(s => s._id === formData.serviceId);
      const duration = service?.duration || 60; // Default to 60 minutes
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
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
        service: formData.serviceId,
        client: customerId,
        businessId: businessId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
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
      console.error('Error creating appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment');
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
          {businessInfo.logoUrl && (
            <img 
              src={businessInfo.logoUrl} 
              alt={businessInfo.name}
              style={{ 
                height: '50px', 
                marginBottom: '10px',
                filter: 'brightness(0) invert(1)'
              }} 
            />
          )}
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '600' }}>
            {businessInfo.name}
          </h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
            {businessInfo.description}
          </p>
        </div>
        
        <div className="booking-page-container" style={{
          maxWidth: '600px',
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
                  {stepNum === 1 ? 'Service' : stepNum === 2 ? 'Information' : 'Schedule'}
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
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="booking-step">
                <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Select a Service</h2>
                
                <div className="services-list">
                  {services.length === 0 ? (
                    <p>No services available at this time.</p>
                  ) : (
                    services.map(service => (
                      <div 
                        key={service._id}
                        className="service-item"
                        style={{
                          padding: '15px',
                          marginBottom: '15px',
                          border: `2px solid ${formData.serviceId === service._id ? businessInfo.primaryColor : '#e5e7eb'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: formData.serviceId === service._id ? `${businessInfo.primaryColor}15` : '#fff'
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, serviceId: service._id }))}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{service.title}</h3>
                          <span style={{ fontWeight: 'bold' }}>${service.price?.amount || 0}</span>
                        </div>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#4b5563' }}>{service.description}</p>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                          <span>Duration: {service.duration} min</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="booking-actions" style={{ marginTop: '30px' }}>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.serviceId || services.length === 0}
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
                      opacity: (!formData.serviceId || services.length === 0) ? 0.6 : 1
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
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
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
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
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
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
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
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
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
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="time" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Time *</label>
                  <input 
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
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
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="notes" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Additional Notes</label>
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
                    placeholder="Any special instructions or requests..."
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
                    disabled={!formData.date || !formData.time || submitting}
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
                      opacity: (!formData.date || !formData.time || submitting) ? 0.6 : 1
                    }}
                  >
                    {submitting ? 'Booking...' : 'Book Appointment'}
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
                
                <h2 style={{ color: '#111827', marginBottom: '15px', fontSize: '24px' }}>Booking Confirmed!</h2>
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
                  <p style={{ marginBottom: '10px' }}><strong>Service:</strong> {services.find(s => s._id === formData.serviceId)?.title}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Time:</strong> {formData.time}</p>
                  <p style={{ marginBottom: '0' }}><strong>Name:</strong> {formData.name}</p>
                </div>
                
                <button 
                  onClick={() => {
                    // Reset form and go back to step 1
                    setFormData({
                      serviceId: '',
                      name: '',
                      email: '',
                      phone: '',
                      date: '',
                      time: '',
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
                  Book Another Appointment
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
            Powered by DogServices Booking System
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
          <h2>Book an Appointment</h2>
          <p>This booking interface is integrated with the main application.</p>
          {/* Booking form elements would go here */}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;