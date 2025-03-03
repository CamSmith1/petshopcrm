import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, parseISO, formatISO, isAfter, isSameDay } from 'date-fns';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';

// Components
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/**
 * Client booking page - allows clients to book services
 * This is the public-facing booking flow
 */
const ClientBooking = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  
  // Booking flow steps
  const STEPS = {
    SERVICE_SELECTION: 0,
    DATE_TIME_SELECTION: 1,
    CLIENT_DETAILS: 2,
    PAYMENT: 3,
    CONFIRMATION: 4
  };
  
  // State
  const [currentStep, setCurrentStep] = useState(STEPS.SERVICE_SELECTION);
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedStaffMember, setSelectedStaffMember] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [clientInfo, setClientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    customFieldAnswers: {}
  });
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState(null);
  const [error, setError] = useState(null);
  
  // Load initial data
  useEffect(() => {
    const loadBusinessData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be actual API calls
        // For demo purposes, we're using mock data
        
        // Mock business data
        const businessData = {
          _id: businessId || 'business123',
          name: 'Acme Service Provider',
          logo: 'https://example.com/logo.png',
          description: 'Professional service provider for all your needs',
          contactEmail: 'contact@acme.com',
          contactPhone: '(555) 123-4567',
          address: '123 Main St, Anytown, USA',
          settings: {
            requirePayment: true,
            depositPercentage: 50,
            cancellationPolicy: 'Cancellations must be made 24 hours in advance for a full refund.'
          }
        };
        
        // Mock service categories
        const categoriesData = [
          {
            _id: 'cat1',
            name: 'Consultation Services',
            description: 'Professional consultation services',
            icon: 'consultation',
            color: '#4f46e5'
          },
          {
            _id: 'cat2',
            name: 'Training Sessions',
            description: 'Expert training sessions',
            icon: 'training',
            color: '#0ea5e9'
          },
          {
            _id: 'cat3',
            name: 'Wellness Services',
            description: 'Comprehensive wellness services',
            icon: 'wellness',
            color: '#10b981'
          }
        ];
        
        // Mock services
        const servicesData = [
          {
            _id: 'serv1',
            name: 'Initial Consultation',
            description: 'One-on-one consultation to assess your needs',
            duration: 60, // in minutes
            price: 100.00,
            categoryId: 'cat1',
            customFields: ['allergies', 'preferences'],
            maxCapacity: 1,
            active: true
          },
          {
            _id: 'serv2',
            name: 'Follow-up Consultation',
            description: 'Follow-up session to review progress',
            duration: 30,
            price: 50.00,
            categoryId: 'cat1',
            customFields: ['progress'],
            maxCapacity: 1,
            active: true
          },
          {
            _id: 'serv3',
            name: 'Group Training',
            description: 'Small group training session',
            duration: 90,
            price: 75.00,
            categoryId: 'cat2',
            customFields: ['experience_level'],
            maxCapacity: 5,
            active: true
          },
          {
            _id: 'serv4',
            name: 'Private Training',
            description: 'One-on-one training session',
            duration: 60,
            price: 120.00,
            categoryId: 'cat2',
            customFields: ['experience_level', 'goals'],
            maxCapacity: 1,
            active: true
          },
          {
            _id: 'serv5',
            name: 'Wellness Assessment',
            description: 'Comprehensive wellness assessment',
            duration: 75,
            price: 130.00,
            categoryId: 'cat3',
            customFields: ['medical_history', 'current_medications'],
            maxCapacity: 1,
            active: true
          }
        ];
        
        // Mock custom fields
        const customFieldsData = [
          {
            _id: 'allergies',
            name: 'Allergies',
            description: 'Please list any allergies',
            type: 'text',
            required: false
          },
          {
            _id: 'preferences',
            name: 'Preferences',
            description: 'Any specific preferences we should know about',
            type: 'text',
            required: false
          },
          {
            _id: 'progress',
            name: 'Progress Update',
            description: 'Brief update on your progress since last session',
            type: 'textarea',
            required: true
          },
          {
            _id: 'experience_level',
            name: 'Experience Level',
            description: 'Your experience level',
            type: 'select',
            options: ['Beginner', 'Intermediate', 'Advanced'],
            required: true
          },
          {
            _id: 'goals',
            name: 'Goals',
            description: 'What are your goals for this session?',
            type: 'textarea',
            required: true
          },
          {
            _id: 'medical_history',
            name: 'Medical History',
            description: 'Relevant medical history',
            type: 'textarea',
            required: true
          },
          {
            _id: 'current_medications',
            name: 'Current Medications',
            description: 'List all current medications',
            type: 'text',
            required: false
          }
        ];
        
        // Mock staff members
        const staffData = [
          {
            _id: 'staff1',
            name: 'John Doe',
            title: 'Senior Consultant',
            bio: 'Experienced consultant with 10+ years in the field',
            services: ['serv1', 'serv2']
          },
          {
            _id: 'staff2',
            name: 'Jane Smith',
            title: 'Master Trainer',
            bio: 'Certified trainer specializing in advanced techniques',
            services: ['serv3', 'serv4']
          },
          {
            _id: 'staff3',
            name: 'Alex Johnson',
            title: 'Wellness Expert',
            bio: 'Wellness specialist with holistic approach',
            services: ['serv5']
          }
        ];
        
        setBusiness(businessData);
        setServiceCategories(categoriesData);
        setServices(servicesData);
        setCustomFields(customFieldsData);
        setStaffMembers(staffData);
        
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0]._id);
        }
        
      } catch (error) {
        console.error('Error loading business data:', error);
        setError('Failed to load business information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBusinessData();
  }, [businessId]);
  
  // Filter services by selected category
  const filteredServices = selectedCategory 
    ? services.filter(service => service.categoryId === selectedCategory && service.active)
    : services.filter(service => service.active);
  
  // Generate available dates (next 14 days)
  useEffect(() => {
    if (selectedService) {
      const dates = [];
      const startDate = new Date();
      
      // Generate the next 14 days
      for (let i = 0; i < 14; i++) {
        const date = addDays(startDate, i);
        dates.push(date);
      }
      
      setAvailableDates(dates);
    }
  }, [selectedService]);
  
  // Generate time slots for selected date
  useEffect(() => {
    if (selectedDate && selectedService) {
      // This would be an API call to check actual availability
      // For demo purposes, we'll generate mock time slots
      
      const timeSlots = [];
      
      // Business hours: 9am - 5pm
      const startHour = 9;
      const endHour = 17;
      
      // Calculate number of possible slots based on service duration
      const serviceDuration = selectedService.duration;
      const minutesInDay = (endHour - startHour) * 60;
      const possibleSlots = Math.floor(minutesInDay / serviceDuration);
      
      // Generate time slots
      for (let i = 0; i < possibleSlots; i++) {
        const slotMinutes = startHour * 60 + i * serviceDuration;
        const hours = Math.floor(slotMinutes / 60);
        const minutes = slotMinutes % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Randomly mark some slots as unavailable for demo purposes
        const isAvailable = Math.random() > 0.3;
        
        if (isAvailable) {
          timeSlots.push({
            time: timeString,
            available: true
          });
        }
      }
      
      setAvailableTimeSlots(timeSlots);
      setSelectedTimeSlot(null);
    }
  }, [selectedDate, selectedService]);
  
  // Get a service by ID
  const getServiceById = (serviceId) => {
    return services.find(service => service._id === serviceId) || null;
  };
  
  // Get a category by ID
  const getCategoryById = (categoryId) => {
    return serviceCategories.find(category => category._id === categoryId) || null;
  };
  
  // Get custom fields for a service
  const getCustomFieldsForService = (service) => {
    if (!service || !service.customFields) return [];
    
    return customFields.filter(field => 
      service.customFields.includes(field._id)
    );
  };
  
  // Get staff for a service
  const getStaffForService = (service) => {
    if (!service) return [];
    
    return staffMembers.filter(staff => 
      staff.services.includes(service._id)
    );
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedService(null);
  };
  
  // Handle service selection
  const handleServiceSelect = (serviceId) => {
    const service = getServiceById(serviceId);
    setSelectedService(service);
    
    // Reset subsequent selections
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedStaffMember(null);
    
    // Move to next step
    setCurrentStep(STEPS.DATE_TIME_SELECTION);
    
    // Get staff for this service
    const serviceStaff = getStaffForService(service);
    if (serviceStaff.length === 1) {
      setSelectedStaffMember(serviceStaff[0]._id);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  // Handle staff member selection
  const handleStaffSelect = (staffId) => {
    setSelectedStaffMember(staffId);
  };
  
  // Handle client info changes
  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('custom_')) {
      // Handle custom field
      const fieldId = name.replace('custom_', '');
      setClientInfo(prev => ({
        ...prev,
        customFieldAnswers: {
          ...prev.customFieldAnswers,
          [fieldId]: value
        }
      }));
    } else {
      // Handle standard field
      setClientInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Proceed to next step
  const proceedToNextStep = () => {
    // Validate current step
    if (currentStep === STEPS.DATE_TIME_SELECTION) {
      if (!selectedDate || !selectedTimeSlot) {
        toast.error('Please select both date and time');
        return;
      }
      
      if (selectedService && getStaffForService(selectedService).length > 0 && !selectedStaffMember) {
        toast.error('Please select a staff member');
        return;
      }
    } else if (currentStep === STEPS.CLIENT_DETAILS) {
      // Validate client info
      const { firstName, lastName, email, phone, customFieldAnswers } = clientInfo;
      
      if (!firstName || !lastName || !email || !phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      // Validate custom fields
      const serviceCustomFields = getCustomFieldsForService(selectedService);
      const requiredFields = serviceCustomFields.filter(field => field.required);
      
      for (const field of requiredFields) {
        if (!customFieldAnswers[field._id]) {
          toast.error(`Please fill in the "${field.name}" field`);
          return;
        }
      }
      
      // Check if payment is required
      if (business?.settings?.requirePayment && selectedService?.price > 0) {
        setPaymentRequired(true);
        setPaymentAmount(selectedService.price);
        
        // Create payment intent (would be an API call in a real app)
        // Mock for demo
        setPaymentIntent({
          clientSecret: 'mock_secret_' + Date.now()
        });
      }
    }
    
    // Proceed to next step
    setCurrentStep(prev => prev + 1);
  };
  
  // Go back to previous step
  const goToPreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Complete booking
  const completeBooking = async () => {
    setIsLoading(true);
    
    try {
      // This would be an API call in a real application
      // For demo purposes, we'll just simulate a successful booking
      
      setTimeout(() => {
        // Generate a booking reference
        const reference = `BK${Date.now().toString().substring(7)}`;
        
        setBookingReference(reference);
        setBookingConfirmed(true);
        setCurrentStep(STEPS.CONFIRMATION);
        setIsLoading(false);
        
        // Show success message
        toast.success('Booking confirmed successfully!');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setIsLoading(false);
      toast.error('Failed to complete booking. Please try again.');
    }
  };
  
  // Get icon for category
  const getCategoryIcon = (categoryId) => {
    const category = getCategoryById(categoryId);
    if (!category) return '📋';
    
    const iconMap = {
      'consultation': '💬',
      'training': '🏋️',
      'wellness': '🧘'
    };
    
    return iconMap[category.icon] || '📋';
  };
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Format date
  const formatDate = (date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };
  
  // Format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes.padStart(2, '0')} ${period}`;
  };
  
  // Get staff name by ID
  const getStaffName = (staffId) => {
    const staff = staffMembers.find(s => s._id === staffId);
    return staff ? staff.name : 'Any Available Staff';
  };
  
  // Payment component using Stripe
  const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!stripe || !elements) {
        return;
      }
      
      setIsProcessing(true);
      setPaymentError(null);
      
      // In a real app, this would use the actual clientSecret from your server
      // For demo, we'll just simulate a successful payment
      
      // Wait a bit to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsProcessing(false);
      
      // Move to completion
      completeBooking();
    };
    
    const cardElementOptions = {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: 'Arial, sans-serif',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    };
    
    return (
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="card-element">Credit or debit card</label>
          <div className="card-element-container">
            <CardElement id="card-element" options={cardElementOptions} />
          </div>
        </div>
        
        {paymentError && (
          <div className="payment-error">{paymentError}</div>
        )}
        
        <div className="form-actions">
          <Button
            type="button"
            secondary
            onClick={goToPreviousStep}
            disabled={isProcessing}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            primary
            disabled={!stripe || isProcessing}
            loading={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(paymentAmount)}`}
          </Button>
        </div>
      </form>
    );
  };
  
  // Render step: Service Selection
  const renderServiceSelection = () => (
    <div className="service-selection-step">
      <h2>Select a Service</h2>
      
      <div className="categories-list">
        {serviceCategories.map(category => (
          <div 
            key={category._id}
            className={`category-item ${selectedCategory === category._id ? 'selected' : ''}`}
            onClick={() => handleCategorySelect(category._id)}
            style={{ borderColor: category.color }}
          >
            <div className="category-icon" style={{ backgroundColor: category.color }}>
              {getCategoryIcon(category._id)}
            </div>
            <div className="category-name">{category.name}</div>
          </div>
        ))}
      </div>
      
      <div className="services-list">
        {filteredServices.map(service => (
          <div 
            key={service._id}
            className={`service-card ${selectedService?._id === service._id ? 'selected' : ''}`}
            onClick={() => handleServiceSelect(service._id)}
          >
            <div className="service-header">
              <h3 className="service-name">{service.name}</h3>
              <div className="service-price">{formatPrice(service.price)}</div>
            </div>
            
            <div className="service-details">
              <div className="service-duration">
                <span className="icon">⏱️</span> 
                {service.duration} minutes
              </div>
              
              <p className="service-description">{service.description}</p>
            </div>
            
            <Button small primary>
              Select
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render step: Date & Time Selection
  const renderDateTimeSelection = () => (
    <div className="date-time-selection-step">
      <h2>Select Date & Time</h2>
      
      <div className="booking-summary">
        <h3>Selected Service</h3>
        <div className="service-summary">
          <div className="service-name">{selectedService?.name}</div>
          <div className="service-details">
            <span>{formatPrice(selectedService?.price)}</span>
            <span>•</span>
            <span>{selectedService?.duration} minutes</span>
          </div>
        </div>
        
        <Button small secondary onClick={() => setCurrentStep(STEPS.SERVICE_SELECTION)}>
          Change Service
        </Button>
      </div>
      
      <div className="date-time-container">
        <div className="date-selection">
          <h3>Select Date</h3>
          <div className="dates-grid">
            {availableDates.map(date => (
              <div 
                key={date.toString()}
                className={`date-card ${selectedDate && isSameDay(date, selectedDate) ? 'selected' : ''}`}
                onClick={() => handleDateSelect(date)}
              >
                <div className="date-weekday">{format(date, 'EEE')}</div>
                <div className="date-day">{format(date, 'd')}</div>
                <div className="date-month">{format(date, 'MMM')}</div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedDate && (
          <div className="time-selection">
            <h3>Select Time</h3>
            
            {availableTimeSlots.length === 0 ? (
              <p className="no-slots-message">No available time slots for this date. Please select another date.</p>
            ) : (
              <div className="time-slots-grid">
                {availableTimeSlots.map(slot => (
                  <div 
                    key={slot.time}
                    className={`time-slot ${selectedTimeSlot === slot.time ? 'selected' : ''}`}
                    onClick={() => handleTimeSlotSelect(slot.time)}
                  >
                    {formatTime(slot.time)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {selectedService && getStaffForService(selectedService).length > 0 && (
          <div className="staff-selection">
            <h3>Select Provider</h3>
            
            <div className="staff-list">
              {getStaffForService(selectedService).map(staff => (
                <div 
                  key={staff._id}
                  className={`staff-card ${selectedStaffMember === staff._id ? 'selected' : ''}`}
                  onClick={() => handleStaffSelect(staff._id)}
                >
                  <div className="staff-avatar">
                    {staff.name.charAt(0)}
                  </div>
                  <div className="staff-info">
                    <div className="staff-name">{staff.name}</div>
                    <div className="staff-title">{staff.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="booking-actions">
        <Button secondary onClick={() => setCurrentStep(STEPS.SERVICE_SELECTION)}>
          Back
        </Button>
        
        <Button 
          primary 
          disabled={!selectedDate || !selectedTimeSlot || (getStaffForService(selectedService).length > 0 && !selectedStaffMember)}
          onClick={proceedToNextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
  
  // Render step: Client Details
  const renderClientDetails = () => (
    <div className="client-details-step">
      <h2>Your Information</h2>
      
      <div className="booking-summary">
        <h3>Booking Summary</h3>
        <div className="summary-item">
          <div className="summary-label">Service:</div>
          <div className="summary-value">{selectedService?.name}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Date:</div>
          <div className="summary-value">{formatDate(selectedDate)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Time:</div>
          <div className="summary-value">{formatTime(selectedTimeSlot)}</div>
        </div>
        {selectedStaffMember && (
          <div className="summary-item">
            <div className="summary-label">Provider:</div>
            <div className="summary-value">{getStaffName(selectedStaffMember)}</div>
          </div>
        )}
        <div className="summary-item">
          <div className="summary-label">Duration:</div>
          <div className="summary-value">{selectedService?.duration} minutes</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Price:</div>
          <div className="summary-value">{formatPrice(selectedService?.price)}</div>
        </div>
      </div>
      
      <div className="client-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name*</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={clientInfo.firstName}
              onChange={handleClientInfoChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name*</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={clientInfo.lastName}
              onChange={handleClientInfoChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={clientInfo.email}
              onChange={handleClientInfoChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={clientInfo.phone}
              onChange={handleClientInfoChange}
              required
            />
          </div>
        </div>
        
        {/* Custom fields for selected service */}
        {getCustomFieldsForService(selectedService).map(field => (
          <div className="form-group" key={field._id}>
            <label htmlFor={`custom_${field._id}`}>
              {field.name}
              {field.required && '*'}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                id={`custom_${field._id}`}
                name={`custom_${field._id}`}
                value={clientInfo.customFieldAnswers[field._id] || ''}
                onChange={handleClientInfoChange}
                required={field.required}
                placeholder={field.description}
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                id={`custom_${field._id}`}
                name={`custom_${field._id}`}
                value={clientInfo.customFieldAnswers[field._id] || ''}
                onChange={handleClientInfoChange}
                required={field.required}
                rows={4}
                placeholder={field.description}
              ></textarea>
            )}
            
            {field.type === 'select' && (
              <select
                id={`custom_${field._id}`}
                name={`custom_${field._id}`}
                value={clientInfo.customFieldAnswers[field._id] || ''}
                onChange={handleClientInfoChange}
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            
            {field.description && (
              <div className="field-description">{field.description}</div>
            )}
          </div>
        ))}
        
        <div className="booking-policies">
          <h3>Booking Policies</h3>
          <p>{business?.settings?.cancellationPolicy}</p>
          
          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" required />
              I agree to the booking policies and terms of service
            </label>
          </div>
        </div>
      </div>
      
      <div className="booking-actions">
        <Button secondary onClick={goToPreviousStep}>
          Back
        </Button>
        
        <Button primary onClick={proceedToNextStep}>
          {paymentRequired ? 'Proceed to Payment' : 'Complete Booking'}
        </Button>
      </div>
    </div>
  );
  
  // Render step: Payment
  const renderPayment = () => (
    <div className="payment-step">
      <h2>Payment Information</h2>
      
      <div className="payment-summary">
        <h3>Booking Summary</h3>
        <div className="summary-item">
          <div className="summary-label">Service:</div>
          <div className="summary-value">{selectedService?.name}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Date & Time:</div>
          <div className="summary-value">{formatDate(selectedDate)} at {formatTime(selectedTimeSlot)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Provider:</div>
          <div className="summary-value">{selectedStaffMember ? getStaffName(selectedStaffMember) : 'Any Available Staff'}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Client:</div>
          <div className="summary-value">{clientInfo.firstName} {clientInfo.lastName}</div>
        </div>
        <div className="summary-item total">
          <div className="summary-label">Total Amount:</div>
          <div className="summary-value">{formatPrice(paymentAmount)}</div>
        </div>
      </div>
      
      <div className="payment-container">
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </div>
    </div>
  );
  
  // Render step: Confirmation
  const renderConfirmation = () => (
    <div className="confirmation-step">
      <div className="confirmation-icon">✅</div>
      
      <h2>Booking Confirmed!</h2>
      
      <div className="confirmation-details">
        <p className="confirmation-message">
          Your booking has been confirmed. We've sent a confirmation email to {clientInfo.email}.
        </p>
        
        <div className="confirmation-reference">
          Booking Reference: <strong>{bookingReference}</strong>
        </div>
        
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <div className="summary-label">Service:</div>
            <div className="summary-value">{selectedService?.name}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Date & Time:</div>
            <div className="summary-value">{formatDate(selectedDate)} at {formatTime(selectedTimeSlot)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Provider:</div>
            <div className="summary-value">{selectedStaffMember ? getStaffName(selectedStaffMember) : 'Any Available Staff'}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Location:</div>
            <div className="summary-value">{business?.address}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Duration:</div>
            <div className="summary-value">{selectedService?.duration} minutes</div>
          </div>
        </div>
        
        <div className="confirmation-actions">
          <Button primary onClick={() => navigate('/')}>
            Book Another Appointment
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.SERVICE_SELECTION:
        return renderServiceSelection();
      case STEPS.DATE_TIME_SELECTION:
        return renderDateTimeSelection();
      case STEPS.CLIENT_DETAILS:
        return renderClientDetails();
      case STEPS.PAYMENT:
        return renderPayment();
      case STEPS.CONFIRMATION:
        return renderConfirmation();
      default:
        return renderServiceSelection();
    }
  };
  
  // Render progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      { key: STEPS.SERVICE_SELECTION, label: 'Service' },
      { key: STEPS.DATE_TIME_SELECTION, label: 'Date & Time' },
      { key: STEPS.CLIENT_DETAILS, label: 'Your Details' },
      { key: STEPS.PAYMENT, label: 'Payment', condition: paymentRequired },
      { key: STEPS.CONFIRMATION, label: 'Confirmation' }
    ].filter(step => step.condition !== false);
    
    return (
      <div className="booking-progress">
        {steps.map((step, index) => (
          <div 
            key={step.key} 
            className={`progress-step ${currentStep >= step.key ? 'active' : ''} ${currentStep === step.key ? 'current' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step.label}</div>
            {index < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>
    );
  };
  
  // If loading
  if (isLoading) {
    return <LoadingSpinner text="Loading booking system..." />;
  }
  
  // If error
  if (error) {
    return (
      <div className="booking-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <Button primary onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="client-booking-page">
      <div className="booking-container">
        <div className="booking-header">
          {business && (
            <div className="business-info">
              <h1 className="business-name">{business.name}</h1>
              <p className="business-description">{business.description}</p>
            </div>
          )}
          
          {currentStep < STEPS.CONFIRMATION && renderProgressIndicator()}
        </div>
        
        <div className="booking-content">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;