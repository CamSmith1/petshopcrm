import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import '../styles/booking-page.css';

const BookingPageSetup = () => {
  const { currentUser } = useAuth();
  const { businessProfile } = useBusiness();
  const businessId = businessProfile?._id || '';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  
  // Demo services for testing
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
  
  // Booking page configuration state
  const [config, setConfig] = useState({
    title: 'Book an Appointment',
    subtitle: 'Follow the steps below to schedule your service',
    businessName: businessProfile?.name || 'My Business',
    businessDescription: businessProfile?.description || 'Professional services',
    logoUrl: '',
    primaryColor: '#4f46e5',
    showPrices: true,
    allowNotes: true,
    requirePhone: false,
    enabledServices: [],
    showAllServices: true,
    emailNotifications: true,
    confirmationMessage: 'Your appointment has been scheduled. You will receive a confirmation email shortly.'
  });

  // Generate the booking page URL with configuration parameters
  const getBookingPageUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    params.append('businessId', businessId);
    
    // Only add configuration params if they differ from defaults
    if (!config.showAllServices && config.enabledServices.length > 0) {
      params.append('services', config.enabledServices.join(','));
    }
    
    if (config.primaryColor !== '#4f46e5') {
      params.append('color', encodeURIComponent(config.primaryColor));
    }
    
    if (config.title !== 'Book an Appointment') {
      params.append('title', encodeURIComponent(config.title));
    }
    
    return `${baseUrl}/booking?${params.toString()}`;
  };

  // Load services and existing configuration
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use demo services for this demo
        setServices(DEMO_SERVICES);
        
        // Try to load existing configuration
        try {
          // For demo purposes, we'll just simulate loading a config
          // In a real app, this would be: const configResponse = await api.getBookingPageConfig(businessId);
          
          // Set default enabled services to all services
          setConfig(prev => ({
            ...prev,
            enabledServices: DEMO_SERVICES.map(s => s._id)
          }));
          
        } catch (configError) {
          console.log('No existing configuration found, using defaults');
          // Set default enabled services to all services
          setConfig(prev => ({
            ...prev,
            enabledServices: DEMO_SERVICES.map(s => s._id)
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load service information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle service toggle
  const handleServiceToggle = (serviceId) => {
    setConfig(prev => {
      const enabledServices = [...prev.enabledServices];
      if (enabledServices.includes(serviceId)) {
        return {
          ...prev,
          enabledServices: enabledServices.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prev,
          enabledServices: [...enabledServices, serviceId]
        };
      }
    });
  };
  
  // Toggle all services
  const toggleAllServices = (select) => {
    if (select) {
      setConfig(prev => ({
        ...prev,
        enabledServices: services.map(s => s._id)
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        enabledServices: []
      }));
    }
  };
  
  // Save configuration
  const saveConfig = async () => {
    setSaving(true);
    try {
      // Simulate API call
      // In a real app: await api.saveBookingPageConfig(businessId, { config });
      
      // For demo, we'll just wait a second to simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Booking page configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Copy to clipboard utility
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy link');
      });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const bookingPageUrl = getBookingPageUrl();
  
  // Generate HTML button code
  const generateButtonCode = () => {
    return `<a href="${bookingPageUrl}" target="_blank" 
style="display: inline-block; background-color: ${config.primaryColor}; color: white; 
padding: 10px 20px; text-decoration: none; border-radius: 4px; font-family: sans-serif;">
Book Now</a>`;
  };

  return (
    <div className="page-container booking-setup-page">
      <PageHeader 
        title="Booking Page Setup" 
        description="Configure and share your booking page with clients or add it to your website"
      />
      
      {services.length === 0 ? (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          You don't have any services set up yet. Please add some services before configuring your booking page.
        </div>
      ) : (
        <div className="settings-container">
          {/* Sidebar navigation for settings */}
          <div className="settings-sidebar">
            <div className="settings-nav">
              <h4 className="settings-nav-title">Configuration</h4>
              
              <div 
                className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="fas fa-cog mr-2"></i>
                General Settings
              </div>
              
              <div 
                className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <i className="fas fa-palette mr-2"></i>
                Appearance
              </div>
              
              <div 
                className={`settings-nav-item ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                <i className="fas fa-list-check mr-2"></i>
                Services
              </div>
              
              <h4 className="settings-nav-title mt-4">Distribution</h4>
              
              <div 
                className={`settings-nav-item ${activeTab === 'share' ? 'active' : ''}`}
                onClick={() => setActiveTab('share')}
              >
                <i className="fas fa-share-alt mr-2"></i>
                Share
              </div>
              
              <div 
                className={`settings-nav-item ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                <i className="fas fa-eye mr-2"></i>
                Preview
              </div>
            </div>
            
            <div className="settings-action mt-auto">
              <button 
                className="btn btn-primary btn-block" 
                onClick={saveConfig}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="settings-content">
            <div className="settings-header">
              <h2>{activeTab === 'general' ? 'General Settings' : 
                  activeTab === 'appearance' ? 'Appearance Settings' : 
                  activeTab === 'services' ? 'Service Settings' : 
                  activeTab === 'share' ? 'Share Your Booking Page' : 
                  'Booking Page Preview'}</h2>
              <p className="text-muted">
                {activeTab === 'general' ? 'Configure the general settings for your booking page.' : 
                 activeTab === 'appearance' ? 'Customize the look and feel of your booking page.' : 
                 activeTab === 'services' ? 'Choose which services to offer on your booking page.' : 
                 activeTab === 'share' ? 'Share your booking page with clients or add it to your website.' : 
                 'Preview what your clients will see when they visit your booking page.'}
              </p>
            </div>
          
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="card">
                <div className="card-body">
                  <div className="settings-form">
                  
                    <div className="form-group mb-3">
                      <label htmlFor="businessName">Business Name</label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        className="form-control"
                        value={config.businessName}
                        onChange={handleInputChange}
                        placeholder="Your business name"
                      />
                      <small className="form-text text-muted">
                        This will appear in the header of your booking page.
                      </small>
                    </div>
                    
                    <div className="form-group mb-3">
                      <label htmlFor="businessDescription">Business Description</label>
                      <textarea
                        id="businessDescription"
                        name="businessDescription"
                        className="form-control"
                        value={config.businessDescription}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Short description of your business"
                      />
                      <small className="form-text text-muted">
                        A brief description that will appear below your business name.
                      </small>
                    </div>
                    
                    <div className="form-group mb-3">
                      <label htmlFor="title">Page Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="form-control"
                        value={config.title}
                        onChange={handleInputChange}
                        placeholder="Book an Appointment"
                      />
                      <small className="form-text text-muted">
                        The main heading displayed on your booking page.
                      </small>
                    </div>
                    
                    <div className="form-group mb-3">
                      <label htmlFor="subtitle">Page Subtitle</label>
                      <input
                        type="text"
                        id="subtitle"
                        name="subtitle"
                        className="form-control"
                        value={config.subtitle}
                        onChange={handleInputChange}
                        placeholder="Follow the steps below to schedule your service"
                      />
                      <small className="form-text text-muted">
                        The text displayed below the title.
                      </small>
                    </div>
                    
                    <div className="form-group mb-3">
                      <label htmlFor="confirmationMessage">Confirmation Message</label>
                      <textarea
                        id="confirmationMessage"
                        name="confirmationMessage"
                        className="form-control"
                        value={config.confirmationMessage}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Thank you for your booking..."
                      />
                      <small className="form-text text-muted">
                        Message displayed after a successful booking.
                      </small>
                    </div>
                    
                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="requirePhone"
                        name="requirePhone"
                        checked={config.requirePhone}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="requirePhone">
                        Require phone number
                      </label>
                    </div>
                    
                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="emailNotifications"
                        name="emailNotifications"
                        checked={config.emailNotifications}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="emailNotifications">
                        Send email notifications
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="card">
                <div className="card-body">
                  <div className="settings-form">
                  
                    <div className="form-group mb-3">
                      <label htmlFor="logoUrl">Logo URL</label>
                      <input
                        type="text"
                        id="logoUrl"
                        name="logoUrl"
                        className="form-control"
                        value={config.logoUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/your-logo.png"
                      />
                      <small className="form-text text-muted">
                        URL to your logo image (optional).
                      </small>
                    </div>
                    
                    <div className="form-group mb-3">
                      <label htmlFor="primaryColor">Primary Color</label>
                      <div className="input-group">
                        <div
                          className="color-preview mr-2"
                          style={{
                            width: '40px',
                            height: '38px',
                            backgroundColor: config.primaryColor,
                            border: '1px solid #ced4da',
                            borderRadius: '0.25rem',
                            marginRight: '10px'
                          }}
                        ></div>
                        <input
                          type="text"
                          id="primaryColor"
                          name="primaryColor"
                          className="form-control"
                          value={config.primaryColor}
                          onChange={handleInputChange}
                          placeholder="#4f46e5"
                        />
                      </div>
                      <small className="form-text text-muted">
                        The main color used for buttons and accents. Use hex format (e.g., #4f46e5).
                      </small>
                    </div>
                    
                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="showPrices"
                        name="showPrices"
                        checked={config.showPrices}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="showPrices">
                        Show service prices
                      </label>
                    </div>
                    
                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="allowNotes"
                        name="allowNotes"
                        checked={config.allowNotes}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="allowNotes">
                        Allow customers to add notes
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="card">
                <div className="card-body">
                  <div className="settings-form">
                  
                    <div className="form-check mb-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="showAllServices"
                        name="showAllServices"
                        checked={config.showAllServices}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="showAllServices">
                        <strong>Show all services</strong>
                      </label>
                      <div className="text-muted small mt-1">
                        When enabled, all active services will be available on your booking page.
                        When disabled, you can select specific services below.
                      </div>
                    </div>
                    
                    {!config.showAllServices && (
                      <div className="service-selection">
                        <div className="mb-3">
                          <button 
                            className="btn btn-sm btn-outline-primary mr-2"
                            onClick={() => toggleAllServices(true)}
                          >
                            Select All
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleAllServices(false)}
                          >
                            Deselect All
                          </button>
                        </div>
                        
                        <div className="list-group">
                          {services.map(service => (
                            <div 
                              key={service._id}
                              className="list-group-item"
                            >
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`service-${service._id}`}
                                  checked={config.enabledServices.includes(service._id)}
                                  onChange={() => handleServiceToggle(service._id)}
                                />
                                <label className="form-check-label" htmlFor={`service-${service._id}`}>
                                  <div className="d-flex justify-content-between w-100">
                                    <span><strong>{service.title}</strong></span>
                                    <span className="text-muted">${service.price?.amount || 0}</span>
                                  </div>
                                  <div className="text-muted small">{service.description}</div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Share Tab */}
            {activeTab === 'share' && (
              <div className="card">
                <div className="card-body">
                  <div className="settings-form">
                    <p className="mb-4">
                      Your booking page allows clients to schedule appointments directly. 
                      You can share this link with clients or add it to your website.
                    </p>
                    
                    <div className="d-flex align-items-center mt-4 mb-4">
                      <div 
                        className="booking-url p-3 bg-light rounded flex-grow-1 mr-2"
                        style={{ 
                          border: '1px solid #dee2e6',
                          overflowX: 'auto',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <a href={bookingPageUrl} target="_blank" rel="noreferrer">{bookingPageUrl}</a>
                      </div>
                      <button 
                        className="btn btn-primary ml-2"
                        onClick={() => copyToClipboard(bookingPageUrl)}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    
                    <h4 className="mt-4 mb-3">Share Options</h4>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card mb-3">
                          <div className="card-body">
                            <h5 className="card-title">
                              <i className="fas fa-link mr-2"></i>
                              Direct Link
                            </h5>
                            <p className="card-text">Share this link directly with your clients via email, text messages, or social media.</p>
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => copyToClipboard(bookingPageUrl)}
                            >
                              Copy Link
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card mb-3">
                          <div className="card-body">
                            <h5 className="card-title">
                              <i className="fas fa-code mr-2"></i>
                              Website Button
                            </h5>
                            <p className="card-text">Add a "Book Now" button to your website that links to your booking page.</p>
                            <div className="mt-2 mb-3">
                              <div 
                                className="bg-light p-2 rounded"
                                style={{ fontSize: '0.9rem', overflowX: 'auto' }}
                              >
                                {generateButtonCode()}
                              </div>
                            </div>
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => copyToClipboard(generateButtonCode())}
                            >
                              Copy Code
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="card">
                <div className="card-body">
                  <div className="settings-form">
                    <p className="mb-4">This is what your clients will see when they visit your booking page.</p>
                    
                    <div className="booking-preview mt-4" style={{ border: '1px solid #dee2e6', borderRadius: '8px' }}>
                      <div style={{ padding: '15px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                        <h5 style={{ margin: 0 }}>Booking Page Preview</h5>
                      </div>
                      <div style={{ height: '600px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          right: 0, 
                          bottom: 0, 
                          backgroundColor: 'rgba(255,255,255,0.7)', 
                          zIndex: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          flexDirection: 'column' 
                        }}>
                          <h4>Preview Mode</h4>
                          <p className="mb-0">This is how your booking page will appear to clients.</p>
                          <a 
                            href={bookingPageUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-primary mt-3"
                            style={{ backgroundColor: config.primaryColor, borderColor: config.primaryColor }}
                          >
                            Open actual booking page
                          </a>
                        </div>
                        <iframe 
                          src={bookingPageUrl}
                          title="Booking Page Preview"
                          style={{ border: 'none', width: '100%', height: '100%' }}
                        />
                      </div>
                    </div>
                    
                    <div className="alert alert-info mt-4">
                      <strong>Tip:</strong> To ensure your clients can book appointments successfully, make sure you have services and availability configured in your account settings.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPageSetup;