/**
 * BookingPro Widget
 * 
 * This script creates an embeddable booking widget for businesses of any industry.
 * It loads within the host website and communicates with the BookingPro API.
 * Supports multi-service management, advanced availability, comprehensive booking flow,
 * customization options, and mobile responsiveness.
 */

(function() {
  // Widget configuration
  const config = {
    apiUrl: 'https://api.bookingpro.io',
    containerId: 'bookingpro-widget',
    apiKey: null,
    token: null,
    customization: {
      primaryColor: '#2563eb',
      secondaryColor: '#4f46e5',
      textColor: '#1e293b',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '6px',
      layout: 'standard',
      // New customization options
      logoUrl: null,
      headerText: 'Book an Appointment',
      buttonStyle: 'filled',
      enableDarkMode: false,
      calendarStyle: 'standard'
    },
    // New config options
    features: {
      enableStaffSelection: true,
      enableServiceFiltering: true,
      enableCustomForms: true,
      enablePayments: true,
      enableReminders: true,
      bufferTime: 15, // minutes between appointments
      allowRescheduling: true,
      allowCancellation: true,
      requireClientAccounts: false,
      allowGuestBooking: true
    }
  };

  // Widget state
  let state = {
    initialized: false,
    services: [],
    serviceCategories: [],
    filteredServices: [],
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    selectedStaff: null,
    selectedPet: null,
    pets: [],
    staffMembers: [],
    availableTimeSlots: [],
    step: 'services', // services, datetime, staff, pet, custom-fields, details, payment, confirmation
    user: null,
    isLoggedIn: false,
    formFields: {}, // Stores custom form fields for selected service
    filters: {
      category: null,
      duration: null,
      priceRange: null,
      staffId: null
    },
    formResponses: {}, // Stores user responses to custom form fields
    bufferTimes: {}, // Buffer times between appointments
    recurringAppointment: false,
    recurringFrequency: 'weekly', // weekly, bi-weekly, monthly
    appointmentHistory: []
  };

  // Initialize the widget
  function init() {
    // Get the script tag to extract the API key
    const scripts = document.getElementsByTagName('script');
    const currentScript = Array.from(scripts).find(script => 
      script.src && script.src.includes('widget.js')
    );

    if (!currentScript) {
      console.error('Dog Services Widget: Script tag not found');
      return;
    }

    // Get the API key
    config.apiKey = currentScript.getAttribute('data-api-key');
    
    if (!config.apiKey) {
      console.error('Dog Services Widget: Missing API key');
      return;
    }
    
    // Get customization options
    parseCustomizationAttributes(currentScript);
    
    // Check for responsive setting
    const responsive = currentScript.getAttribute('data-responsive');
    if (responsive === 'true' || responsive === 'false') {
      config.responsive = responsive === 'true';
    }
    
    // Check for required feature settings
    const features = ['staff-selection', 'service-filtering', 'custom-forms', 'payments', 'reminders', 
                      'buffer-time', 'allow-rescheduling', 'allow-cancellation', 'require-client-accounts'];
    
    features.forEach(feature => {
      const dataAttr = currentScript.getAttribute(`data-${feature}`);
      if (dataAttr === 'true' || dataAttr === 'false') {
        const camelCaseFeature = feature.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        config.features[camelCaseFeature] = dataAttr === 'true';
      }
    });
    
    // Check for numeric settings
    const bufferTime = currentScript.getAttribute('data-buffer-time');
    if (bufferTime && !isNaN(parseInt(bufferTime))) {
      config.features.bufferTime = parseInt(bufferTime);
    }
    
    // Create and initialize the widget container
    createWidgetContainer();
    
    // Add responsive styles if enabled
    if (config.responsive !== false) {
      addResponsiveStyles();
    }
    
    // Add accessibility features
    addAccessibilityFeatures();
    
    // Request a token from the server
    requestToken();
    
    // Check for returning users
    checkReturningUser();
    
    // Load service categories
    loadServiceCategories();
    
    // Load staff members if staff selection is enabled
    if (config.features.enableStaffSelection) {
      loadStaffMembers();
    }
  }
  
  // Parse customization attributes from script tag
  function parseCustomizationAttributes(scriptTag) {
    // Process standard color options
    const customAttrs = [
      { attr: 'data-color', prop: 'primaryColor' },
      { attr: 'data-primary-color', prop: 'primaryColor' },
      { attr: 'data-secondary-color', prop: 'secondaryColor' },
      { attr: 'data-text-color', prop: 'textColor' },
      { attr: 'data-font-family', prop: 'fontFamily' },
      { attr: 'data-border-radius', prop: 'borderRadius' },
      { attr: 'data-layout', prop: 'layout' },
      { attr: 'data-logo-url', prop: 'logoUrl' },
      { attr: 'data-header-text', prop: 'headerText' },
      { attr: 'data-button-style', prop: 'buttonStyle' }
    ];
    
    customAttrs.forEach(({attr, prop}) => {
      const value = scriptTag.getAttribute(attr);
      if (value) config.customization[prop] = value;
    });
    
    // Boolean attributes
    const darkMode = scriptTag.getAttribute('data-dark-mode');
    if (darkMode === 'true' || darkMode === 'false') {
      config.customization.enableDarkMode = darkMode === 'true';
    }
    
    // Calendar style
    const calendarStyle = scriptTag.getAttribute('data-calendar-style');
    if (calendarStyle && ['standard', 'compact', 'expanded'].includes(calendarStyle)) {
      config.customization.calendarStyle = calendarStyle;
    }
  }
  
  // Add responsive styles based on device size
  function addResponsiveStyles() {
    const style = document.createElement('style');
    style.id = 'bp-responsive-styles';
    style.textContent = `
      @media (max-width: 768px) {
        #${config.containerId} .bp-services-list {
          grid-template-columns: 1fr !important;
        }
        #${config.containerId} .ds-time-slots .ds-time-option {
          min-width: 80px !important;
        }
        #${config.containerId} .ds-pet-selector {
          grid-template-columns: 1fr !important;
        }
        #${config.containerId} .ds-widget-nav {
          flex-direction: column !important;
          gap: 10px !important;
        }
        #${config.containerId} .ds-widget-nav button {
          width: 100% !important;
        }
      }
      @media (max-width: 480px) {
        #${config.containerId} {
          padding: 15px !important;
        }
        #${config.containerId} .ds-calendar {
          font-size: 14px !important;
        }
        #${config.containerId} .ds-new-pet-form > div,
        #${config.containerId} .ds-contact-form > div {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add accessibility features
  function addAccessibilityFeatures() {
    const style = document.createElement('style');
    style.id = 'bp-accessibility-styles';
    style.textContent = `
      #${config.containerId} button:focus,
      #${config.containerId} input:focus,
      #${config.containerId} select:focus,
      #${config.containerId} textarea:focus {
        outline: 2px solid ${config.customization.primaryColor} !important;
        outline-offset: 2px !important;
      }
      #${config.containerId} .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: ${config.customization.primaryColor};
        color: white;
        padding: 8px;
        z-index: 100;
        transition: top 0.3s;
      }
      #${config.containerId} .skip-link:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Check for returning user and restore their session if possible
  function checkReturningUser() {
    try {
      // Try to get saved user info from localStorage
      const savedUser = localStorage.getItem('bp-user-info');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        state.user = userData;
        
        // Check if we have saved pets
        const savedPets = localStorage.getItem('bp-user-pets');
        if (savedPets) {
          state.pets = JSON.parse(savedPets);
        }
        
        // Check if we have booking history
        const bookingHistory = localStorage.getItem('bp-booking-history');
        if (bookingHistory) {
          state.appointmentHistory = JSON.parse(bookingHistory);
        }
      }
    } catch (e) {
      console.error('Error checking for returning user:', e);
      // Clear potentially corrupted data
      localStorage.removeItem('bp-user-info');
      localStorage.removeItem('bp-user-pets');
      localStorage.removeItem('bp-booking-history');
    }
  }

  // Request widget token from server
  function requestToken() {
    const payload = {
      timestamp: Date.now(),
      origin: window.location.origin
    };
    
    // In a real implementation, you would generate a signature using the secret key
    // However, since we're in the browser, we'll mock this for demo purposes
    // In production, the page should make a server-to-server request to get a token
    
    fetch(`${config.apiUrl}/api/widget/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: config.apiKey,
        signature: 'demo-signature', // This would be generated server-side
        payload,
        customization: config.customization
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        config.token = data.token;
        state.initialized = true;
        
        // Load services
        loadServices();
        
        // Render the initial view
        renderWidget();
      } else {
        showError('Failed to initialize widget. Please try again later.');
      }
    })
    .catch(error => {
      console.error('Widget initialization error:', error);
      showError('Failed to initialize widget. Please try again later.');
    });
  }

  // Load service categories
  function loadServiceCategories() {
    fetch(`${config.apiUrl}/api/widget/service-categories`, {
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.categories) {
        state.serviceCategories = data.categories;
      } else {
        console.warn('No service categories found');
      }
    })
    .catch(error => {
      console.error('Error loading service categories:', error);
    });
  }

  // Load staff members
  function loadStaffMembers() {
    fetch(`${config.apiUrl}/api/widget/staff`, {
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.staff) {
        state.staffMembers = data.staff;
      } else {
        console.warn('No staff members found');
      }
    })
    .catch(error => {
      console.error('Error loading staff members:', error);
    });
  }

  // Load available services
  function loadServices() {
    fetch(`${config.apiUrl}/api/widget/services`, {
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.services) {
        state.services = data.services;
        state.filteredServices = [...state.services]; // Initialize filtered services
        renderServicesList();
      } else {
        showError('Failed to load services.');
      }
    })
    .catch(error => {
      console.error('Error loading services:', error);
      showError('Failed to load services. Please try again later.');
    });
  }
  
  // Load service specific form fields
  function loadServiceFormFields(serviceId) {
    fetch(`${config.apiUrl}/api/widget/services/${serviceId}/form-fields`, {
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.formFields) {
        state.formFields[serviceId] = data.formFields;
      } else {
        state.formFields[serviceId] = []; // No custom fields
      }
      
      // If we're on the custom fields step, render it
      if (state.step === 'custom-fields') {
        renderCustomFields();
      }
    })
    .catch(error => {
      console.error('Error loading service form fields:', error);
      state.formFields[serviceId] = []; // Initialize empty on error
    });
  }
  
  // Load available time slots for a specific date
  function loadAvailableTimeSlots(date, serviceId, staffId = null) {
    // Set up the query parameters
    const params = new URLSearchParams({
      date,
      serviceId
    });
    
    if (staffId) {
      params.append('staffId', staffId);
    }
    
    fetch(`${config.apiUrl}/api/widget/availability?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.timeSlots) {
        state.availableTimeSlots = data.timeSlots;
        
        // If we're on the datetime step, update the rendered time slots
        if (state.step === 'datetime') {
          renderTimeSlots();
        }
      } else {
        state.availableTimeSlots = []; // No available slots
        if (state.step === 'datetime') {
          renderTimeSlots(); // Render empty slots with message
        }
      }
    })
    .catch(error => {
      console.error('Error loading available time slots:', error);
      state.availableTimeSlots = []; // Initialize empty on error
      if (state.step === 'datetime') {
        renderTimeSlots(); // Render empty slots with error message
      }
    });
  }

  // Create widget container
  function createWidgetContainer() {
    const container = document.getElementById(config.containerId);
    
    if (!container) {
      console.error(`BookingPro Widget: Container #${config.containerId} not found`);
      return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Set container styles
    container.style.fontFamily = config.customization.fontFamily;
    container.style.color = config.customization.textColor;
    container.style.border = `1px solid #e2e8f0`;
    container.style.borderRadius = config.customization.borderRadius;
    container.style.padding = '24px';
    container.style.maxWidth = '500px';
    container.style.margin = '0 auto';
    container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    
    // Show loading indicator
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="width: 24px; height: 24px; border: 2px solid ${config.customization.primaryColor}20; 
                    border-top: 2px solid ${config.customization.primaryColor}; border-radius: 50%; 
                    margin: 0 auto 16px; animation: bp-spin 1s linear infinite;"></div>
        <p style="color: ${config.customization.textColor}80;">Loading booking widget...</p>
      </div>
      <style>
        @keyframes bp-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  // Render the main widget content
  function renderWidget() {
    const container = document.getElementById(config.containerId);
    
    if (!container) return;
    
    // Render different views based on current step
    switch (state.step) {
      case 'services':
        renderServicesList();
        break;
      case 'datetime':
        renderDateTimePicker();
        break;
      case 'pet':
        renderPetSelector();
        break;
      case 'details':
        renderBookingDetails();
        break;
      case 'confirmation':
        renderConfirmation();
        break;
      default:
        renderServicesList();
    }
  }

  // Render services list with filtering options
  function renderServicesList() {
    const container = document.getElementById(config.containerId);
    
    if (!container) return;
    
    // Get services to display (filtered or all)
    const servicesToDisplay = state.filteredServices.length > 0 ? state.filteredServices : state.services;
    
    let html = `
      <a href="#bp-main-content" class="skip-link">Skip to main content</a>
      <div class="bp-widget-header" style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid ${config.customization.primaryColor}15;">
        ${config.customization.logoUrl ? 
          `<img src="${config.customization.logoUrl}" alt="Business logo" style="max-height: 60px; margin-bottom: 15px;">` : 
          ''
        }
        <h2 style="color: ${config.customization.primaryColor}; margin-bottom: 8px; font-size: 22px; font-weight: 600;">${config.customization.headerText || 'Book an Appointment'}</h2>
        <p style="color: ${config.customization.textColor}80;">Select a service to continue</p>
      </div>
    `;
    
    // Add filtering options if enabled
    if (config.features.enableServiceFiltering && state.serviceCategories.length > 0) {
      html += `
        <div class="bp-filters" style="margin-bottom: 25px; background: ${config.customization.enableDarkMode ? '#2d3748' : '#f8fafc'}; padding: 15px; border-radius: ${config.customization.borderRadius};">
          <div style="margin-bottom: 10px; font-weight: 600; color: ${config.customization.textColor};">Filter Services</div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
            <button 
              class="bp-category-filter ${!state.filters.category ? 'active' : ''}" 
              style="
                padding: 8px 12px; 
                border: 1px solid ${!state.filters.category ? config.customization.primaryColor : '#e2e8f0'}; 
                background: ${!state.filters.category ? `${config.customization.primaryColor}20` : 'transparent'};
                color: ${config.customization.textColor};
                border-radius: ${config.customization.borderRadius};
                cursor: pointer;
                font-size: 14px;
              "
              onclick="window.BookingProWidget.filterByCategory(null)">
              All
            </button>
            
            ${state.serviceCategories.map(category => `
              <button 
                class="bp-category-filter ${state.filters.category === category.id ? 'active' : ''}" 
                style="
                  padding: 8px 12px; 
                  border: 1px solid ${state.filters.category === category.id ? config.customization.primaryColor : '#e2e8f0'}; 
                  background: ${state.filters.category === category.id ? `${config.customization.primaryColor}20` : 'transparent'};
                  color: ${config.customization.textColor};
                  border-radius: ${config.customization.borderRadius};
                  cursor: pointer;
                  font-size: 14px;
                "
                onclick="window.BookingProWidget.filterByCategory('${category.id}')">
                ${category.name}
              </button>
            `).join('')}
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <label style="display: block; margin-bottom: 5px; font-size: 14px; color: ${config.customization.textColor}80;">Duration</label>
              <select 
                style="
                  width: 100%; 
                  padding: 8px 12px; 
                  border: 1px solid #e2e8f0; 
                  border-radius: ${config.customization.borderRadius};
                  background: ${config.customization.enableDarkMode ? '#2d3748' : 'white'};
                  color: ${config.customization.textColor};
                "
                onchange="window.BookingProWidget.filterByDuration(this.value)">
                <option value="">Any duration</option>
                <option value="short">Short (< 30min)</option>
                <option value="medium">Medium (30-60min)</option>
                <option value="long">Long (> 60min)</option>
              </select>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 5px; font-size: 14px; color: ${config.customization.textColor}80;">Price</label>
              <select 
                style="
                  width: 100%; 
                  padding: 8px 12px; 
                  border: 1px solid #e2e8f0; 
                  border-radius: ${config.customization.borderRadius};
                  background: ${config.customization.enableDarkMode ? '#2d3748' : 'white'};
                  color: ${config.customization.textColor};
                "
                onchange="window.BookingProWidget.filterByPrice(this.value)">
                <option value="">Any price</option>
                <option value="low">$ (Economy)</option>
                <option value="medium">$$ (Standard)</option>
                <option value="high">$$$ (Premium)</option>
              </select>
            </div>
          </div>
          
          ${config.features.enableStaffSelection && state.staffMembers.length > 0 ? `
            <div style="margin-top: 15px;">
              <label style="display: block; margin-bottom: 5px; font-size: 14px; color: ${config.customization.textColor}80;">Staff Member</label>
              <select 
                style="
                  width: 100%; 
                  padding: 8px 12px; 
                  border: 1px solid #e2e8f0; 
                  border-radius: ${config.customization.borderRadius};
                  background: ${config.customization.enableDarkMode ? '#2d3748' : 'white'};
                  color: ${config.customization.textColor};
                "
                onchange="window.BookingProWidget.filterByStaff(this.value)">
                <option value="">Any staff member</option>
                ${state.staffMembers.map(staff => `
                  <option value="${staff._id}">${staff.name}</option>
                `).join('')}
              </select>
            </div>
          ` : ''}
          
          ${state.filteredServices.length !== state.services.length ? `
            <div style="margin-top: 15px; text-align: right;">
              <button 
                style="
                  padding: 8px 12px; 
                  border: none;
                  background: transparent;
                  color: ${config.customization.primaryColor};
                  cursor: pointer;
                  font-size: 14px;
                  text-decoration: underline;
                "
                onclick="window.BookingProWidget.clearFilters()">
                Clear filters
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    html += `<div id="bp-main-content" class="bp-services-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">`;
    
    if (servicesToDisplay.length === 0) {
      html += `
        <div style="text-align: center; grid-column: 1/-1; color: ${config.customization.textColor}80; padding: 30px 0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 15px; display: block; opacity: 0.5;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <p style="margin-bottom: 5px; font-weight: 600;">No services found</p>
          <p style="margin-top: 0;">Try adjusting your filters or check back later.</p>
        </div>
      `;
    } else {
      servicesToDisplay.forEach(service => {
        // Generate icon based on service.category (without emoji)
        const getServiceIcon = (category) => {
          // SVG icons based on category
          const icons = {
            default: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
            consultation: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
            treatment: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
            training: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
            assessment: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
            coaching: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
            
            // New industry-specific icons
            grooming: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l4.5-4.5c.8-.8 2-.8 2.8 0L13 5"></path><path d="M10 14l6.5-6.5c.8-.8 2-.8 2.8 0l.7.7"></path><path d="M18 12l-8 8-8-8"></path><path d="M2 16h12"></path><path d="M22 16h-2"></path></svg>`,
            boarding: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
            daycare: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
            veterinary: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8"></path><path d="M12 14v7"></path><path d="M8 14h8"></path><path d="M17 14l4-4a2 2 0 0 0 0-3l-2-2a2 2 0 0 0-3 0l-3 3"></path><path d="M7 14 3 10a2 2 0 0 1 0-3l2-2a2 2 0 0 1 3 0l3 3"></path></svg>`,
            walking: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="5" r="2"></circle><path d="M12 15l-2.8-2.8a2 2 0 0 0-2.2-.4l-4.2 1.8a2 2 0 0 0-1.1 1.4l-.5 3a2 2 0 0 0 .6 1.9l3.8 3.2c.3.2.6.4.9.4h4a2 2 0 0 0 1.3-.5l5.5-5.5"></path><path d="m9 14 1.5-3"></path><path d="M9.5 9 11 6l4 2.5L13.5 12l-3 3.5"></path><path d="M14 19.5v3"></path><path d="M17 10.8 22 12"></path></svg>`
          };
          
          return icons[category] || icons.default;
        };
        
        // Calculate badge text based on service duration
        let durationBadge = '';
        if (service.duration < 30) {
          durationBadge = `<span style="background: #e6f7ff; color: #0891b2; font-size: 12px; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">Short</span>`;
        } else if (service.duration >= 30 && service.duration <= 60) {
          durationBadge = `<span style="background: #f0fdf4; color: #16a34a; font-size: 12px; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">Medium</span>`;
        } else {
          durationBadge = `<span style="background: #fef9c3; color: #ca8a04; font-size: 12px; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">Long</span>`;
        }
        
        html += `
          <div class="bp-service-item" 
               style="padding: 20px; border: 1px solid #e2e8f0; 
                      border-radius: ${config.customization.borderRadius}; cursor: pointer;
                      background: ${config.customization.enableDarkMode ? '#1e293b' : 'white'}; 
                      transition: all 0.2s ease;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.05);"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.1)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';"
               onclick="window.BookingProWidget.selectService('${service._id}')"
               aria-label="Select service: ${service.title}, ${service.duration} minutes, $${service.price.amount}">
            <div style="color: ${config.customization.primaryColor}; margin-bottom: 12px; text-align: center;">
              ${getServiceIcon(service.category)}
            </div>
            <h3 style="margin-top: 0; color: ${config.customization.textColor}; text-align: center; font-size: 16px; font-weight: 600;">
              ${service.title}
            </h3>
            ${service.description ? `
              <p style="font-size: 14px; color: ${config.customization.textColor}80; margin: 10px 0; text-align: center; line-height: 1.4;">
                ${service.description.length > 80 ? service.description.substring(0, 80) + '...' : service.description}
              </p>
            ` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid ${config.customization.enableDarkMode ? '#334155' : '#e2e8f0'}; font-size: 14px;">
              <span style="font-weight: 600; color: ${config.customization.textColor};">
                $${service.price.amount}
              </span>
              <div style="display: flex; align-items: center; gap: 5px;">
                <span style="color: ${config.customization.textColor}80;">
                  ${service.duration} min
                </span>
                ${durationBadge}
              </div>
            </div>
            ${service.capacity && service.capacity < 3 ? `
              <div style="margin-top: 10px; text-align: center; font-size: 13px; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;">
                Only ${service.capacity} spots left
              </div>
            ` : ''}
          </div>
        `;
      });
    }
    
    html += `
      </div>
      
      <div class="bp-client-account" style="margin-top: 30px; text-align: center;">
        ${state.isLoggedIn ? `
          <div style="background: ${config.customization.enableDarkMode ? '#1e293b' : '#f8fafc'}; padding: 15px; border-radius: ${config.customization.borderRadius}; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background: ${config.customization.primaryColor}20; color: ${config.customization.primaryColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                ${state.user.firstName ? state.user.firstName.charAt(0) : ''}${state.user.lastName ? state.user.lastName.charAt(0) : ''}
              </div>
              <div style="text-align: left;">
                <div style="font-weight: 600; color: ${config.customization.textColor};">
                  ${state.user.firstName} ${state.user.lastName}
                </div>
                <div style="font-size: 14px; color: ${config.customization.textColor}60;">
                  ${state.appointmentHistory.length > 0 ? `${state.appointmentHistory.length} previous booking${state.appointmentHistory.length > 1 ? 's' : ''}` : 'No previous bookings'}
                </div>
              </div>
            </div>
            <button 
              style="
                padding: 8px 12px; 
                border: 1px solid #e2e8f0; 
                background: transparent;
                color: ${config.customization.textColor};
                border-radius: ${config.customization.borderRadius};
                cursor: pointer;
                font-size: 14px;
              "
              onclick="window.BookingProWidget.viewBookingHistory()">
              View History
            </button>
          </div>
        ` : config.features.requireClientAccounts ? `
          <p style="color: ${config.customization.textColor}80; margin-bottom: 15px;">
            Sign in to your account to book appointments and view your booking history
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button 
              style="
                padding: 10px 15px; 
                border: 1px solid ${config.customization.primaryColor}; 
                background: transparent;
                color: ${config.customization.primaryColor};
                border-radius: ${config.customization.borderRadius};
                cursor: pointer;
                font-weight: 600;
              "
              onclick="window.BookingProWidget.showLoginForm()">
              Sign In
            </button>
            <button 
              style="
                padding: 10px 15px; 
                border: none; 
                background: ${config.customization.primaryColor};
                color: white;
                border-radius: ${config.customization.borderRadius};
                cursor: pointer;
                font-weight: 600;
              "
              onclick="window.BookingProWidget.showSignupForm()">
              Create Account
            </button>
          </div>
        ` : ''}
      </div>
      
      <div class="bp-widget-footer" style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid ${config.customization.enableDarkMode ? '#334155' : '#e2e8f0'}; font-size: 12px; color: ${config.customization.textColor}60;">
        <p>Powered by <a href="#" style="color: ${config.customization.primaryColor}; text-decoration: none;">BookingPro</a></p>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  // Render service filtering UI
  function applyServiceFilters() {
    // Start with all services
    let filtered = [...state.services];
    
    // Apply category filter
    if (state.filters.category) {
      filtered = filtered.filter(service => service.categoryId === state.filters.category);
    }
    
    // Apply duration filter
    if (state.filters.duration) {
      switch (state.filters.duration) {
        case 'short':
          filtered = filtered.filter(service => service.duration < 30);
          break;
        case 'medium':
          filtered = filtered.filter(service => service.duration >= 30 && service.duration <= 60);
          break;
        case 'long':
          filtered = filtered.filter(service => service.duration > 60);
          break;
      }
    }
    
    // Apply price filter
    if (state.filters.priceRange) {
      switch (state.filters.priceRange) {
        case 'low':
          filtered = filtered.filter(service => service.price.amount < 50);
          break;
        case 'medium':
          filtered = filtered.filter(service => service.price.amount >= 50 && service.price.amount <= 100);
          break;
        case 'high':
          filtered = filtered.filter(service => service.price.amount > 100);
          break;
      }
    }
    
    // Apply staff filter
    if (state.filters.staffId) {
      filtered = filtered.filter(service => 
        service.staffIds && service.staffIds.includes(state.filters.staffId)
      );
    }
    
    // Update filtered services state
    state.filteredServices = filtered;
    
    // Re-render the services list
    renderServicesList();
  }

  // Render date and time picker
  function renderDateTimePicker() {
    const container = document.getElementById(config.containerId);
    if (!container) return;
    
    // Get the selected service
    const service = state.services.find(s => s._id === state.selectedService);
    
    if (!service) {
      state.step = 'services';
      renderWidget();
      return;
    }
    
    // Get current month and year
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create calendar for current month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Generate time slots (simplified example)
    const timeSlots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push(`${hour}:00`);
      timeSlots.push(`${hour}:30`);
    }
    
    // Get day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let html = `
      <div class="ds-widget-header" style="text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${config.customization.primaryColor}20;">
        <h2 style="color: ${config.customization.primaryColor}; margin-bottom: 5px; font-size: 22px;">
          Select Appointment Time
        </h2>
        <p style="color: #666; display: flex; align-items: center; justify-content: center; gap: 5px;">
          <span style="font-size: 20px;">✂️</span>
          <span>${service.title} (${service.duration} min)</span>
        </p>
      </div>
      
      <div class="ds-scheduler">
        <div class="ds-calendar" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <button style="border: none; background: none; cursor: pointer; color: ${config.customization.primaryColor};">
              ◀ Previous
            </button>
            <h3 style="margin: 0; font-size: 16px;">${new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <button style="border: none; background: none; cursor: pointer; color: ${config.customization.primaryColor};">
              Next ▶
            </button>
          </div>
          
          <!-- Calendar day headers -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; margin-bottom: 5px;">
            ${dayNames.map(day => `<div style="font-weight: bold; font-size: 14px;">${day}</div>`).join('')}
          </div>
          
          <!-- Calendar dates -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
            ${Array(firstDay).fill(0).map(() => `<div></div>`).join('')}
            
            ${Array(daysInMonth).fill(0).map((_, index) => {
              const day = index + 1;
              const dateObj = new Date(currentYear, currentMonth, day);
              const dateStr = dateObj.toISOString().split('T')[0];
              const isSelected = state.selectedDate === dateStr;
              const isToday = dateObj.toDateString() === today.toDateString();
              const isPast = dateObj < today && !isToday;
              const isDisabled = isPast;
              
              return `
                <div 
                  class="ds-date-option ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
                  style="
                    padding: 10px 0; 
                    border: 1px solid ${isSelected ? config.customization.primaryColor : '#eee'}; 
                    border-radius: ${config.customization.borderRadius}; 
                    cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
                    background-color: ${isSelected ? `${config.customization.primaryColor}20` : isToday ? '#f9f9f9' : 'white'};
                    color: ${isPast ? '#ccc' : 'inherit'};
                    position: relative;
                    text-align: center;
                  "
                  ${!isDisabled ? `onclick="window.DogServicesWidget.selectDate('${dateStr}')"` : ''}
                >
                  ${day}
                  ${isToday ? `<span style="position: absolute; width: 4px; height: 4px; background: ${config.customization.primaryColor}; border-radius: 50%; bottom: 3px; left: 50%; transform: translateX(-50%);"></span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="ds-time-slots" style="margin-top: 25px;">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #555;">Available Times on ${state.selectedDate ? new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Selected Date'}</h3>
          
          ${!state.selectedDate ? 
            `<p style="text-align: center; color: #666; padding: 20px; background: #f9f9f9; border-radius: ${config.customization.borderRadius};">Please select a date from the calendar above</p>` :
            `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px;">
              ${timeSlots.map(time => {
                const isSelected = state.selectedTime === time;
                const isAvailable = Math.random() > 0.3; // Simulate availability (would be from API in real app)
                
                return `
                  <div 
                    class="ds-time-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}" 
                    style="
                      padding: 10px 0; 
                      border: 1px solid ${isSelected ? config.customization.primaryColor : isAvailable ? '#eee' : '#f5f5f5'}; 
                      border-radius: ${config.customization.borderRadius}; 
                      cursor: ${isAvailable ? 'pointer' : 'not-allowed'};
                      background-color: ${isSelected ? `${config.customization.primaryColor}20` : isAvailable ? 'white' : '#f9f9f9'};
                      color: ${!isAvailable ? '#ccc' : 'inherit'};
                      text-align: center;
                      font-size: 14px;
                    "
                    ${isAvailable ? `onclick="window.DogServicesWidget.selectTime('${time}')"` : ''}
                  >
                    ${time}
                  </div>
                `;
              }).join('')}
            </div>
            `
          }
        </div>
      </div>
      
      <div class="ds-booking-summary" style="margin-top: 25px; padding: 15px; background-color: #f9f9f9; border-radius: ${config.customization.borderRadius}; display: ${state.selectedDate && state.selectedTime ? 'block' : 'none'};">
        <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: ${config.customization.primaryColor};">Appointment Summary</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Service:</span>
          <span style="font-weight: bold;">${service.title}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Date:</span>
          <span style="font-weight: bold;">${state.selectedDate ? new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Time:</span>
          <span style="font-weight: bold;">${state.selectedTime || ''}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Duration:</span>
          <span style="font-weight: bold;">${service.duration} min</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px;">
          <span>Price:</span>
          <span style="font-weight: bold;">$${service.price.amount} ${service.price.currency}</span>
        </div>
      </div>
      
      <div class="ds-widget-nav" style="display: flex; justify-content: space-between; margin-top: 25px;">
        <button 
          style="padding: 10px 15px; background-color: #f5f5f5; border: none; 
                 border-radius: ${config.customization.borderRadius}; cursor: pointer;
                 color: #333; font-weight: bold;"
          onclick="window.DogServicesWidget.goToStep('services')">
          « Back to Services
        </button>
        <button 
          style="padding: 10px 20px; background-color: ${config.customization.primaryColor}; 
                 color: white; border: none; border-radius: ${config.customization.borderRadius}; 
                 cursor: pointer; font-weight: bold;
                 ${(!state.selectedDate || !state.selectedTime) ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
          onclick="window.DogServicesWidget.goToStep('pet')"
          ${(!state.selectedDate || !state.selectedTime) ? 'disabled' : ''}>
          Continue »
        </button>
      </div>
      
      <div class="ds-widget-footer" style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>Online scheduling available 24/7</p>
      </div>
    `;
    
    container.innerHTML = html;
  }

  // Render pet selector
  function renderPetSelector() {
    const container = document.getElementById(config.containerId);
    if (!container) return;
    
    // Get selected service and date/time
    const service = state.services.find(s => s._id === state.selectedService);
    
    // Mock pet list - in a real implementation, this would come from the user's account
    // or allow them to input pet details
    state.pets = [
      { id: 'pet1', name: 'Buddy', breed: 'Golden Retriever', age: 3, image: '🐕' },
      { id: 'pet2', name: 'Max', breed: 'Beagle', age: 2, image: '🐶' },
      { id: 'pet3', name: 'Bella', breed: 'Poodle', age: 5, image: '🦮' }
    ];
    
    let html = `
      <div class="ds-widget-header" style="text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${config.customization.primaryColor}20;">
        <h2 style="color: ${config.customization.primaryColor}; margin-bottom: 5px; font-size: 22px;">Your Pet Information</h2>
        <p style="color: #666;">Select or add a pet for this appointment</p>
      </div>
      
      <div class="ds-appointment-summary" style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: ${config.customization.borderRadius};">
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
          <div style="background: ${config.customization.primaryColor}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">1</div>
          <div style="flex: 1;">
            <div style="font-weight: bold;">${service.title}</div>
            <div style="font-size: 14px; color: #666;">${state.selectedDate ? new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''} at ${state.selectedTime}</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="background: #f1f1f1; color: #666; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</div>
          <div style="flex: 1;">
            <div style="font-weight: bold;">Pet Information</div>
            <div style="font-size: 14px; color: #666;">We're on this step</div>
          </div>
        </div>
      </div>
      
      <div class="ds-pet-selector" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
    `;
    
    // Render pet options
    state.pets.forEach(pet => {
      const isSelected = state.selectedPet === pet.id;
      html += `
        <div 
          class="ds-pet-option ${isSelected ? 'selected' : ''}" 
          style="
            padding: 15px; 
            border: 2px solid ${isSelected ? config.customization.primaryColor : '#eee'}; 
            border-radius: ${config.customization.borderRadius}; 
            cursor: pointer;
            background-color: ${isSelected ? `${config.customization.primaryColor}10` : 'white'};
            text-align: center;
            transition: all 0.2s;
            box-shadow: ${isSelected ? `0 5px 15px rgba(0,0,0,0.1)` : 'none'};
          "
          onclick="window.DogServicesWidget.selectPet('${pet.id}')">
          <div style="font-size: 40px; margin-bottom: 10px;">${pet.image}</div>
          <h3 style="margin: 0 0 5px 0; color: ${config.customization.primaryColor};">${pet.name}</h3>
          <div style="font-size: 13px; color: #666;">
            <div>${pet.breed}</div>
            <div>${pet.age} years old</div>
          </div>
        </div>
      `;
    });
    
    // Add option to add a new pet
    html += `
        <div 
          class="ds-pet-option add-new" 
          style="
            padding: 15px; 
            border: 2px dashed #ddd; 
            border-radius: ${config.customization.borderRadius}; 
            cursor: pointer;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 150px;
          "
          onclick="window.DogServicesWidget.addNewPet()">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f1f1f1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            font-size: 24px;
            color: ${config.customization.primaryColor};
          ">+</div>
          <div style="color: ${config.customization.primaryColor}; font-weight: bold;">Add New Pet</div>
        </div>
      </div>
      
      <div class="ds-new-pet-form" style="margin-top: 30px; display: ${state.showNewPetForm ? 'block' : 'none'};">
        <h3 style="margin-top: 0; color: ${config.customization.primaryColor}; font-size: 16px;">New Pet Information</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Pet Name *</label>
            <input 
              type="text" 
              id="ds-pet-name" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                     border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
              placeholder="Your pet's name"
            />
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Breed *</label>
            <input 
              type="text" 
              id="ds-pet-breed" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                     border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
              placeholder="Pet breed"
            />
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Age *</label>
            <input 
              type="number" 
              id="ds-pet-age" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                     border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
              placeholder="Age in years"
              min="0"
            />
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Weight (lbs)</label>
            <input 
              type="number" 
              id="ds-pet-weight" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                     border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
              placeholder="Weight in pounds"
              min="0"
            />
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 14px;">Special Instructions</label>
          <textarea 
            id="ds-pet-notes" 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                   border-radius: ${config.customization.borderRadius}; box-sizing: border-box; min-height: 80px;"
            placeholder="Any special information we should know about your pet"
          ></textarea>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button 
            style="padding: 8px 15px; background-color: #f5f5f5; border: none; 
                   border-radius: ${config.customization.borderRadius}; cursor: pointer;"
            onclick="window.DogServicesWidget.cancelNewPet()">
            Cancel
          </button>
          <button 
            style="padding: 8px 15px; background-color: ${config.customization.primaryColor}; 
                   color: white; border: none; border-radius: ${config.customization.borderRadius}; cursor: pointer;"
            onclick="window.DogServicesWidget.saveNewPet()">
            Add Pet
          </button>
        </div>
      </div>
      
      <div class="ds-widget-nav" style="display: flex; justify-content: space-between; margin-top: 30px;">
        <button 
          style="padding: 10px 15px; background-color: #f5f5f5; border: none; 
                 border-radius: ${config.customization.borderRadius}; cursor: pointer;
                 color: #333; font-weight: bold;"
          onclick="window.DogServicesWidget.goToStep('datetime')">
          « Back
        </button>
        <button 
          style="padding: 10px 20px; background-color: ${config.customization.primaryColor}; 
                 color: white; border: none; border-radius: ${config.customization.borderRadius}; 
                 cursor: pointer; font-weight: bold;
                 ${!state.selectedPet ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
          onclick="window.DogServicesWidget.goToStep('details')"
          ${!state.selectedPet ? 'disabled' : ''}>
          Continue »
        </button>
      </div>
      
      <div class="ds-widget-footer" style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>All pet information is securely stored</p>
      </div>
    `;
    
    container.innerHTML = html;
  }

  // Render booking details form
  function renderBookingDetails() {
    const container = document.getElementById(config.containerId);
    if (!container) return;
    
    // Get the selected service and pet
    const service = state.services.find(s => s._id === state.selectedService);
    const pet = state.pets.find(p => p.id === state.selectedPet);
    
    if (!service || !pet) {
      state.step = 'services';
      renderWidget();
      return;
    }
    
    // Calculate appointment end time
    const appointmentTime = state.selectedTime.split(':');
    const startHour = parseInt(appointmentTime[0]);
    const startMinute = parseInt(appointmentTime[1]);
    
    const startDate = new Date(state.selectedDate);
    startDate.setHours(startHour, startMinute, 0);
    
    const endDate = new Date(startDate.getTime() + service.duration * 60000);
    const endTime = `${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    let html = `
      <div class="ds-widget-header" style="text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${config.customization.primaryColor}20;">
        <h2 style="color: ${config.customization.primaryColor}; margin-bottom: 5px; font-size: 22px;">Complete Your Booking</h2>
        <p style="color: #666;">Enter your details to confirm your appointment</p>
      </div>
      
      <div class="ds-appointment-summary" style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: ${config.customization.borderRadius};">
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
          <div style="background: ${config.customization.primaryColor}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">1</div>
          <div style="flex: 1;">
            <div style="font-weight: bold;">${service.title}</div>
            <div style="font-size: 14px; color: #666;">${state.selectedDate ? new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''} at ${state.selectedTime} - ${endTime}</div>
          </div>
          <div style="text-align: right; font-weight: bold; color: ${config.customization.primaryColor};">
            $${service.price.amount}
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
          <div style="background: ${config.customization.primaryColor}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</div>
          <div style="flex: 1;">
            <div style="font-weight: bold;">${pet.name}</div>
            <div style="font-size: 14px; color: #666;">${pet.breed}, ${pet.age} years old</div>
          </div>
          <div style="font-size: 24px;">${pet.image || '🐾'}</div>
        </div>
        
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="background: #f1f1f1; color: #666; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">3</div>
          <div style="flex: 1;">
            <div style="font-weight: bold;">Your Information</div>
            <div style="font-size: 14px; color: #666;">We're on this step</div>
          </div>
        </div>
      </div>
      
      <div class="ds-contact-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">First Name *</label>
            <input 
              type="text" 
              id="ds-customer-first-name" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                     border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
              placeholder="Your first name"
              required
            />
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Last Name *</label>
            <input 
              type="text" 
              id="ds-customer-last-name" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                     border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
              placeholder="Your last name"
              required
            />
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Email Address *</label>
            <input 
              type="email" 
              id="ds-customer-email" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                     border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
              placeholder="Your email address"
              required
            />
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Phone Number *</label>
            <input 
              type="tel" 
              id="ds-customer-phone" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                     border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
              placeholder="Your phone number"
              required
            />
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 14px;">Special Instructions (Optional)</label>
          <textarea 
            id="ds-booking-notes" 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                   border-radius: ${config.customization.borderRadius}; box-sizing: border-box; min-height: 80px;"
            placeholder="Any special requests or information we should know"
          ></textarea>
        </div>
        
        <div style="margin-bottom: 15px; padding: 15px; background-color: ${config.customization.primaryColor}10; border-radius: ${config.customization.borderRadius};">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input 
              type="checkbox" 
              id="ds-reminder" 
              style="margin-right: 10px;"
              checked
            />
            <span>Send me appointment reminders via email and SMS</span>
          </label>
        </div>
        
        <div style="margin-bottom: 15px; border-top: 1px solid #eee; padding-top: 15px;">
          <h3 style="margin-top: 0; margin-bottom: 15px; color: ${config.customization.primaryColor}; font-size: 16px;">Payment Information</h3>
          
          <div style="margin-bottom: 15px; background-color: #f9f9f9; padding: 15px; border-radius: ${config.customization.borderRadius};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>${service.title}</span>
              <span>$${service.price.amount}.00</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
              <span>Total Due Today</span>
              <span style="color: ${config.customization.primaryColor};">$${service.price.amount}.00</span>
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="font-size: 14px; display: block; margin-bottom: 10px;">Payment Method</label>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <label style="
                flex: 1;
                min-width: 120px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: ${config.customization.borderRadius};
                display: flex;
                align-items: center;
                cursor: pointer;
              ">
                <input type="radio" name="payment" value="credit" checked style="margin-right: 10px;">
                <span>Credit Card</span>
              </label>
              
              <label style="
                flex: 1;
                min-width: 120px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: ${config.customization.borderRadius};
                display: flex;
                align-items: center;
                cursor: pointer;
              ">
                <input type="radio" name="payment" value="paypal" style="margin-right: 10px;">
                <span>PayPal</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: ${config.customization.borderRadius};">
        <label style="display: flex; align-items: flex-start; cursor: pointer;">
          <input 
            type="checkbox" 
            id="ds-terms" 
            style="margin-right: 10px; margin-top: 3px;"
            required
          />
          <span style="font-size: 14px;">I agree to the <a href="#" style="color: ${config.customization.primaryColor};">Terms of Service</a> and <a href="#" style="color: ${config.customization.primaryColor};">Cancellation Policy</a>. I understand that my card will be charged $${service.price.amount}.00 upon confirmation.</span>
        </label>
      </div>
      
      <div class="ds-widget-nav" style="display: flex; justify-content: space-between; margin-top: 30px;">
        <button 
          style="padding: 10px 15px; background-color: #f5f5f5; border: none; 
                 border-radius: ${config.customization.borderRadius}; cursor: pointer;
                 color: #333; font-weight: bold;"
          onclick="window.DogServicesWidget.goToStep('pet')">
          « Back
        </button>
        <button 
          class="ds-submit-booking"
          style="padding: 15px 25px; background-color: ${config.customization.primaryColor}; 
                 color: white; border: none; border-radius: ${config.customization.borderRadius}; 
                 cursor: pointer; font-weight: bold; font-size: 16px;"
          onclick="window.DogServicesWidget.submitBooking()">
          Confirm Booking
        </button>
      </div>
      
      <div class="ds-widget-footer" style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>Your booking is secure and encrypted</p>
      </div>
    `;
    
    container.innerHTML = html;

    // Set up event listeners for the full name input
    const firstName = document.getElementById('ds-customer-first-name');
    const lastName = document.getElementById('ds-customer-last-name');
    const email = document.getElementById('ds-customer-email');
    const phone = document.getElementById('ds-customer-phone');
    
    // Populate with saved data if available
    if (state.customer) {
      if (state.customer.firstName) firstName.value = state.customer.firstName;
      if (state.customer.lastName) lastName.value = state.customer.lastName;
      if (state.customer.email) email.value = state.customer.email;
      if (state.customer.phone) phone.value = state.customer.phone;
    }
    
    // Save data as user types
    firstName.addEventListener('input', () => {
      if (!state.customer) state.customer = {};
      state.customer.firstName = firstName.value;
    });
    
    lastName.addEventListener('input', () => {
      if (!state.customer) state.customer = {};
      state.customer.lastName = lastName.value;
    });
    
    email.addEventListener('input', () => {
      if (!state.customer) state.customer = {};
      state.customer.email = email.value;
    });
    
    phone.addEventListener('input', () => {
      if (!state.customer) state.customer = {};
      state.customer.phone = phone.value;
    });
  }

  // Render booking confirmation
  function renderConfirmation() {
    const container = document.getElementById(config.containerId);
    if (!container) return;
    
    const service = state.services.find(s => s._id === state.selectedService);
    const pet = state.pets.find(p => p.id === state.selectedPet);
    
    // Calculate appointment end time
    const appointmentTime = state.selectedTime.split(':');
    const startHour = parseInt(appointmentTime[0]);
    const startMinute = parseInt(appointmentTime[1]);
    
    const startDate = new Date(state.selectedDate);
    startDate.setHours(startHour, startMinute, 0);
    
    const endDate = new Date(startDate.getTime() + service.duration * 60000);
    const endTime = `${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Generate confirmation code
    const confirmationCode = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                             Math.random().toString(10).substring(2, 6);
    
    let html = `
      <div style="background-color: ${config.customization.primaryColor}10; padding: 20px; margin: -20px; margin-bottom: 30px; text-align: center;">
        <div style="margin-bottom: 20px;">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="${config.customization.primaryColor}20"/>
            <path d="M54.5 31L35.5 50L26 40.5" stroke="${config.customization.primaryColor}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 style="color: ${config.customization.primaryColor}; margin-bottom: 5px; font-size: 24px;">Appointment Confirmed!</h2>
        <p style="color: #666; margin-bottom: 10px;">Your booking has been successfully scheduled</p>
      </div>
      
      <div class="ds-appointment-card" style="
        margin-bottom: 30px;
        padding: 0;
        border: 1px solid #eee;
        border-radius: ${config.customization.borderRadius};
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        overflow: hidden;
      ">
        <div style="padding: 15px; background-color: ${config.customization.primaryColor}; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 18px;">Appointment Details</h3>
            <div style="font-size: 14px;">#${confirmationCode}</div>
          </div>
        </div>
        
        <div style="padding: 20px;">
          <div style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: ${config.customization.primaryColor}10;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-size: 24px;
              ">📅</div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 3px;">Date & Time</div>
                <div style="font-weight: bold;">${new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div>${state.selectedTime} - ${endTime}</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: ${config.customization.primaryColor}10;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-size: 24px;
              ">✂️</div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 3px;">Service</div>
                <div style="font-weight: bold;">${service.title}</div>
                <div>${service.duration} minutes</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center;">
              <div style="
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: ${config.customization.primaryColor}10;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-size: 24px;
              ">${pet.image || '🐾'}</div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 3px;">Pet</div>
                <div style="font-weight: bold;">${pet.name}</div>
                <div>${pet.breed}, ${pet.age} years old</div>
              </div>
            </div>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #666;">Service Fee</span>
              <span>$${service.price.amount}.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px;">
              <span>Total Paid</span>
              <span>$${service.price.amount}.00</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
        <div style="
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: ${config.customization.borderRadius};
          display: flex;
          align-items: center;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #4caf5020;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: #4caf50;
            font-size: 20px;
          ">✓</div>
          <div>
            <div style="font-weight: bold; margin-bottom: 3px;">Confirmation Email Sent</div>
            <div style="font-size: 14px; color: #666;">Check your inbox for booking details and instructions</div>
          </div>
        </div>
        
        <div style="
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: ${config.customization.borderRadius};
          display: flex;
          align-items: center;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #2196f320;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: #2196f3;
            font-size: 20px;
          ">🔔</div>
          <div>
            <div style="font-weight: bold; margin-bottom: 3px;">Appointment Reminder</div>
            <div style="font-size: 14px; color: #666;">You'll receive a reminder 24 hours before your appointment</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <button 
          style="
            padding: 15px 25px; 
            background-color: ${config.customization.primaryColor}; 
            color: white; 
            border: none; 
            border-radius: ${config.customization.borderRadius}; 
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            display: inline-flex;
            align-items: center;
            margin-right: 15px;
          "
          onclick="window.DogServicesWidget.startNewBooking()">
          <span style="margin-right: 8px;">📅</span>
          Book Another Appointment
        </button>
        
        <button
          style="
            padding: 15px 25px; 
            background-color: #f5f5f5; 
            color: #333; 
            border: none; 
            border-radius: ${config.customization.borderRadius}; 
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
            display: inline-flex;
            align-items: center;
          "
          onclick="window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.title)}&dates=${startDate.toISOString().replace(/-|:|\\.\\d\\d\\d/g, '')}\/${endDate.toISOString().replace(/-|:|\\.\\d\\d\\d/g, '')}&details=${encodeURIComponent(`Appointment for ${pet.name} (${pet.breed})`)}', '_blank')">
          <span style="margin-right: 8px;">➕</span>
          Add to Calendar
        </button>
      </div>
      
      <div class="ds-widget-footer" style="text-align: center; margin-top: 25px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px;">
        <p>If you need to reschedule, please call (555) 123-4567</p>
      </div>
    `;
    
    container.innerHTML = html;
  }

  // Show error message
  function showError(message) {
    const container = document.getElementById(config.containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #d9534f;">
        <p style="font-weight: bold; margin-bottom: 10px;">Error</p>
        <p>${message}</p>
        <button 
          style="padding: 8px 15px; background-color: ${config.customization.primaryColor}; 
                 color: white; border: none; border-radius: ${config.customization.borderRadius}; 
                 cursor: pointer; margin-top: 15px;"
          onclick="window.DogServicesWidget.init()">
          Try Again
        </button>
      </div>
    `;
  }

  // Render custom form fields
  function renderCustomFields() {
    const container = document.getElementById(config.containerId);
    if (!container) return;
    
    // Get the selected service
    const service = state.services.find(s => s._id === state.selectedService);
    if (!service) {
      state.step = 'services';
      renderWidget();
      return;
    }
    
    // Get custom fields for the service
    const customFields = state.formFields[state.selectedService] || [];
    
    let html = `
      <div class="bp-widget-header" style="text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${config.customization.primaryColor}20;">
        <h2 style="color: ${config.customization.primaryColor}; margin-bottom: 5px; font-size: 22px;">Additional Information</h2>
        <p style="color: #666;">Please provide the following information for your ${service.title}</p>
      </div>
      
      <div class="bp-appointment-summary" style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: ${config.customization.borderRadius};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Service:</span>
          <span style="font-weight: bold;">${service.title}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Date:</span>
          <span style="font-weight: bold;">${state.selectedDate ? new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Time:</span>
          <span style="font-weight: bold;">${state.selectedTime || ''}</span>
        </div>
        ${state.selectedStaff ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Staff:</span>
            <span style="font-weight: bold;">${state.staffMembers.find(s => s._id === state.selectedStaff)?.name || ''}</span>
          </div>
        ` : ''}
        ${state.selectedPet ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Pet:</span>
            <span style="font-weight: bold;">${state.pets.find(p => p.id === state.selectedPet)?.name || ''}</span>
          </div>
        ` : ''}
      </div>
    `;
    
    if (customFields.length === 0) {
      html += `
        <div style="text-align: center; padding: 30px 0; color: #666; background: #f9f9f9; border-radius: ${config.customization.borderRadius}; margin-bottom: 20px;">
          <p>No additional information required for this service.</p>
        </div>
      `;
    } else {
      html += `<div class="bp-custom-fields" style="margin-bottom: 20px;">`;
      
      customFields.forEach(field => {
        const fieldId = `field-${field.id}`;
        const fieldValue = state.formResponses[field.id] || '';
        
        html += `
          <div style="margin-bottom: 15px;">
            <label for="${fieldId}" style="display: block; margin-bottom: 5px; font-weight: ${field.required ? 'bold' : 'normal'};">
              ${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}
            </label>
        `;
        
        switch (field.type) {
          case 'text':
            html += `
              <input 
                type="text" 
                id="${fieldId}" 
                value="${fieldValue}"
                style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                       border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
                onchange="window.BookingProWidget.updateFormField('${field.id}', this.value)"
              />
            `;
            break;
            
          case 'textarea':
            html += `
              <textarea 
                id="${fieldId}" 
                style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                       border-radius: ${config.customization.borderRadius}; box-sizing: border-box; min-height: 100px;"
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
                onchange="window.BookingProWidget.updateFormField('${field.id}', this.value)"
              >${fieldValue}</textarea>
            `;
            break;
            
          case 'select':
            html += `
              <select 
                id="${fieldId}" 
                style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                       border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
                ${field.required ? 'required' : ''}
                onchange="window.BookingProWidget.updateFormField('${field.id}', this.value)"
              >
                <option value="" ${!fieldValue ? 'selected' : ''}>Select an option</option>
                ${field.options.map(option => `
                  <option value="${option.value}" ${fieldValue === option.value ? 'selected' : ''}>${option.label}</option>
                `).join('')}
              </select>
            `;
            break;
            
          case 'checkbox':
            html += `
              <div style="display: flex; align-items: center;">
                <input 
                  type="checkbox" 
                  id="${fieldId}" 
                  ${fieldValue ? 'checked' : ''}
                  style="margin-right: 10px;"
                  ${field.required ? 'required' : ''}
                  onchange="window.BookingProWidget.updateFormField('${field.id}', this.checked)"
                />
                <label for="${fieldId}" style="cursor: pointer;">${field.checkboxLabel || field.label}</label>
              </div>
            `;
            break;
            
          case 'radio':
            html += `
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${field.options.map((option, idx) => `
                  <div style="display: flex; align-items: center;">
                    <input 
                      type="radio" 
                      id="${fieldId}-${idx}" 
                      name="${fieldId}" 
                      value="${option.value}"
                      ${fieldValue === option.value ? 'checked' : ''}
                      style="margin-right: 10px;"
                      ${field.required ? 'required' : ''}
                      onchange="window.BookingProWidget.updateFormField('${field.id}', this.value)"
                    />
                    <label for="${fieldId}-${idx}" style="cursor: pointer;">${option.label}</label>
                  </div>
                `).join('')}
              </div>
            `;
            break;
            
          case 'date':
            html += `
              <input 
                type="date" 
                id="${fieldId}" 
                value="${fieldValue}"
                style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                       border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
                ${field.required ? 'required' : ''}
                onchange="window.BookingProWidget.updateFormField('${field.id}', this.value)"
              />
            `;
            break;
            
          case 'file':
            html += `
              <input 
                type="file" 
                id="${fieldId}" 
                style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                       border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
                accept="${field.fileTypes || '*'}"
                ${field.required ? 'required' : ''}
                onchange="window.BookingProWidget.handleFileUpload('${field.id}', this.files[0])"
              />
            `;
            break;
        }
        
        // Add field description if available
        if (field.description) {
          html += `
            <div style="margin-top: 5px; font-size: 12px; color: #666;">
              ${field.description}
            </div>
          `;
        }
        
        html += `</div>`;
      });
      
      html += `</div>`;
    }
    
    // Add recurring appointment option if the service supports it
    if (service.allowsRecurring) {
      html += `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: ${config.customization.borderRadius};">
          <label style="display: flex; align-items: center; margin-bottom: 15px; cursor: pointer;">
            <input 
              type="checkbox" 
              id="bp-recurring-appointment" 
              ${state.recurringAppointment ? 'checked' : ''}
              style="margin-right: 10px;"
              onchange="window.BookingProWidget.toggleRecurringAppointment(this.checked)"
            />
            <span style="font-weight: bold;">Make this a recurring appointment</span>
          </label>
          
          ${state.recurringAppointment ? `
            <div style="margin-top: 10px;">
              <label style="display: block; margin-bottom: 5px;">Repeat frequency:</label>
              <select 
                id="bp-recurring-frequency" 
                style="width: 100%; padding: 10px; border: 1px solid #ddd; 
                       border-radius: ${config.customization.borderRadius}; box-sizing: border-box;"
                onchange="window.BookingProWidget.updateRecurringFrequency(this.value)"
              >
                <option value="weekly" ${state.recurringFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                <option value="bi-weekly" ${state.recurringFrequency === 'bi-weekly' ? 'selected' : ''}>Every 2 weeks</option>
                <option value="monthly" ${state.recurringFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
              </select>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    html += `
      <div class="bp-widget-nav" style="display: flex; justify-content: space-between; margin-top: 30px;">
        <button 
          style="padding: 10px 15px; background-color: #f5f5f5; border: none; 
                 border-radius: ${config.customization.borderRadius}; cursor: pointer;
                 color: #333; font-weight: bold;"
          onclick="window.BookingProWidget.goToStep('${state.selectedPet ? 'pet' : 'datetime'}')">
          « Back
        </button>
        <button 
          style="padding: 10px 20px; background-color: ${config.customization.primaryColor}; 
                 color: white; border: none; border-radius: ${config.customization.borderRadius}; 
                 cursor: pointer; font-weight: bold;"
          onclick="window.BookingProWidget.goToStep('details')">
          Continue »
        </button>
      </div>
      
      <div class="bp-widget-footer" style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>All information is securely stored</p>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  // Render staff selection
  function renderStaffSelection() {
    const container = document.getElementById(config.containerId);
    if (!container) return;
    
    // Get the selected service
    const service = state.services.find(s => s._id === state.selectedService);
    if (!service) {
      state.step = 'services';
      renderWidget();
      return;
    }
    
    // Get staff members for this service
    const availableStaff = state.staffMembers.filter(staff => 
      !service.staffIds || service.staffIds.includes(staff._id)
    );
    
    let html = `
      <div class="bp-widget-header" style="text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${config.customization.primaryColor}20;">
        <h2 style="color: ${config.customization.primaryColor}; margin-bottom: 5px; font-size: 22px;">Select Staff Member</h2>
        <p style="color: #666;">Choose who you'd like for your appointment</p>
      </div>
      
      <div class="bp-appointment-summary" style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: ${config.customization.borderRadius};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Service:</span>
          <span style="font-weight: bold;">${service.title}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Date:</span>
          <span style="font-weight: bold;">${state.selectedDate ? new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Time:</span>
          <span style="font-weight: bold;">${state.selectedTime || ''}</span>
        </div>
      </div>
    `;
    
    if (availableStaff.length === 0) {
      html += `
        <div style="text-align: center; padding: 30px 0; color: #666; background: #f9f9f9; border-radius: ${config.customization.borderRadius}; margin-bottom: 20px;">
          <p>No staff members available for this service.</p>
        </div>
      `;
    } else {
      html += `
        <div class="bp-staff-selection" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px;">
      `;
      
      // Option for no preference
      html += `
        <div 
          class="bp-staff-option ${state.selectedStaff === null ? 'selected' : ''}" 
          style="
            padding: 15px; 
            border: 2px solid ${state.selectedStaff === null ? config.customization.primaryColor : '#eee'}; 
            border-radius: ${config.customization.borderRadius}; 
            cursor: pointer;
            background-color: ${state.selectedStaff === null ? `${config.customization.primaryColor}10` : 'white'};
            text-align: center;
            transition: all 0.2s;
          "
          onclick="window.BookingProWidget.selectStaff(null)">
          <div style="font-size: 40px; margin-bottom: 10px;">👥</div>
          <h3 style="margin: 0 0 5px 0; color: ${config.customization.primaryColor};">No Preference</h3>
          <div style="font-size: 13px; color: #666;">
            <div>First Available</div>
          </div>
        </div>
      `;
      
      // Staff options
      availableStaff.forEach(staff => {
        const isSelected = state.selectedStaff === staff._id;
        html += `
          <div 
            class="bp-staff-option ${isSelected ? 'selected' : ''}" 
            style="
              padding: 15px; 
              border: 2px solid ${isSelected ? config.customization.primaryColor : '#eee'}; 
              border-radius: ${config.customization.borderRadius}; 
              cursor: pointer;
              background-color: ${isSelected ? `${config.customization.primaryColor}10` : 'white'};
              text-align: center;
              transition: all 0.2s;
              ${staff.isBooked ? 'opacity: 0.6;' : ''}
            "
            onclick="window.BookingProWidget.selectStaff('${staff._id}')">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #f1f1f1; margin: 0 auto 10px; overflow: hidden;">
              ${staff.imageUrl ? 
                `<img src="${staff.imageUrl}" alt="${staff.name}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<div style="font-size: 40px; line-height: 80px;">${staff.emoji || '👤'}</div>`
              }
            </div>
            <h3 style="margin: 0 0 5px 0; color: ${config.customization.primaryColor};">${staff.name}</h3>
            <div style="font-size: 13px; color: #666;">
              <div>${staff.title || 'Staff'}</div>
              ${staff.experience ? `<div>${staff.experience} years exp.</div>` : ''}
            </div>
            ${staff.isBooked ? `
              <div style="margin-top: 10px; background-color: #fef2f2; color: #ef4444; padding: 5px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                Not Available
              </div>
            ` : ''}
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    html += `
      <div class="bp-widget-nav" style="display: flex; justify-content: space-between; margin-top: 30px;">
        <button 
          style="padding: 10px 15px; background-color: #f5f5f5; border: none; 
                 border-radius: ${config.customization.borderRadius}; cursor: pointer;
                 color: #333; font-weight: bold;"
          onclick="window.BookingProWidget.goToStep('datetime')">
          « Back
        </button>
        <button 
          style="padding: 10px 20px; background-color: ${config.customization.primaryColor}; 
                 color: white; border: none; border-radius: ${config.customization.borderRadius}; 
                 cursor: pointer; font-weight: bold;
                 ${availableStaff.length === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
          onclick="window.BookingProWidget.goToStep('pet')"
          ${availableStaff.length === 0 ? 'disabled' : ''}>
          Continue »
        </button>
      </div>
      
      <div class="bp-widget-footer" style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>Staff availability shown for selected date/time</p>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  // Render time slots based on availability data
  function renderTimeSlots() {
    const timeSlotsContainer = document.querySelector('.ds-time-slots');
    if (!timeSlotsContainer || !state.selectedDate) return;
    
    let html = `
      <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #555;">
        Available Times on ${new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h3>
    `;
    
    if (state.availableTimeSlots.length === 0) {
      html += `
        <p style="text-align: center; color: #666; padding: 20px; background: #f9f9f9; border-radius: ${config.customization.borderRadius};">
          No available time slots for this date. Please select another date.
        </p>
      `;
    } else {
      html += `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px;">
          ${state.availableTimeSlots.map(slot => {
            const isSelected = state.selectedTime === slot.time;
            const isAvailable = slot.available;
            
            return `
              <div 
                class="ds-time-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}" 
                style="
                  padding: 10px 0; 
                  border: 1px solid ${isSelected ? config.customization.primaryColor : isAvailable ? '#eee' : '#f5f5f5'}; 
                  border-radius: ${config.customization.borderRadius}; 
                  cursor: ${isAvailable ? 'pointer' : 'not-allowed'};
                  background-color: ${isSelected ? `${config.customization.primaryColor}20` : isAvailable ? 'white' : '#f9f9f9'};
                  color: ${!isAvailable ? '#ccc' : 'inherit'};
                  text-align: center;
                  font-size: 14px;
                "
                ${isAvailable ? `onclick="window.BookingProWidget.selectTime('${slot.time}')"` : ''}
              >
                ${slot.time}
                ${slot.hasLimitedSpots ? `
                  <div style="font-size: 11px; color: #ef4444; margin-top: 3px;">
                    ${slot.spotsLeft} spot${slot.spotsLeft !== 1 ? 's' : ''} left
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    
    timeSlotsContainer.innerHTML = html;
  }

  // Public API methods
  window.BookingProWidget = {
    init: init,
    
    // Service selection & filtering
    selectService: function(serviceId) {
      state.selectedService = serviceId;
      
      // Load service-specific form fields
      loadServiceFormFields(serviceId);
      
      // Next step depends on configuration
      if (config.features.enableStaffSelection && state.staffMembers.length > 0) {
        state.step = 'datetime'; // We'll select staff after datetime
      } else {
        state.step = 'datetime';
      }
      
      renderWidget();
    },
    
    filterByCategory: function(categoryId) {
      state.filters.category = categoryId;
      applyServiceFilters();
    },
    
    filterByDuration: function(duration) {
      state.filters.duration = duration;
      applyServiceFilters();
    },
    
    filterByPrice: function(priceRange) {
      state.filters.priceRange = priceRange;
      applyServiceFilters();
    },
    
    filterByStaff: function(staffId) {
      state.filters.staffId = staffId;
      applyServiceFilters();
    },
    
    clearFilters: function() {
      state.filters = {
        category: null,
        duration: null,
        priceRange: null,
        staffId: null
      };
      state.filteredServices = [...state.services];
      renderServicesList();
    },
    
    // Date and time selection
    selectDate: function(date) {
      state.selectedDate = date;
      state.selectedTime = null; // Reset time when date changes
      
      // Load available time slots for this date and service
      loadAvailableTimeSlots(date, state.selectedService, state.selectedStaff);
      
      renderDateTimePicker();
    },
    
    selectTime: function(time) {
      state.selectedTime = time;
      renderDateTimePicker();
    },
    
    // Staff selection
    selectStaff: function(staffId) {
      state.selectedStaff = staffId;
      
      // If a date is selected, reload time slots for the new staff
      if (state.selectedDate) {
        loadAvailableTimeSlots(state.selectedDate, state.selectedService, staffId);
      }
      
      renderStaffSelection();
    },
    
    // Pet management
    selectPet: function(petId) {
      state.selectedPet = petId;
      state.showNewPetForm = false; // Hide form when selecting an existing pet
      renderPetSelector();
    },
    
    addNewPet: function() {
      // Show the new pet form
      state.showNewPetForm = true;
      renderPetSelector();
    },
    
    cancelNewPet: function() {
      // Hide the new pet form
      state.showNewPetForm = false;
      renderPetSelector();
    },
    
    saveNewPet: function() {
      // Collect form data
      const name = document.getElementById('ds-pet-name')?.value;
      const breed = document.getElementById('ds-pet-breed')?.value;
      const age = document.getElementById('ds-pet-age')?.value;
      const weight = document.getElementById('ds-pet-weight')?.value;
      const notes = document.getElementById('ds-pet-notes')?.value;
      
      // Validate required fields
      if (!name || !breed || !age) {
        alert('Please fill in all required fields for your pet.');
        return;
      }
      
      // Create new pet
      const newPet = { 
        id: 'new-pet-' + Date.now(), 
        name: name,
        breed: breed, 
        age: parseInt(age),
        weight: weight ? parseInt(weight) : null,
        notes: notes,
        image: '🐕' // Default image
      };
      
      // Add to pets list and select it
      state.pets.push(newPet);
      state.selectedPet = newPet.id;
      state.showNewPetForm = false; // Hide form
      
      // Save to localStorage for returning users
      try {
        localStorage.setItem('bp-user-pets', JSON.stringify(state.pets));
      } catch (e) {
        console.warn('Could not save pet to localStorage', e);
      }
      
      // Render pet selector with new pet
      renderPetSelector();
    },
    
    // Custom form fields
    updateFormField: function(fieldId, value) {
      state.formResponses[fieldId] = value;
    },
    
    handleFileUpload: function(fieldId, file) {
      if (!file) return;
      
      // In a real implementation, this would upload the file to the server
      // For the demo, we'll just store the filename
      state.formResponses[fieldId] = {
        name: file.name,
        size: file.size,
        type: file.type
      };
    },
    
    // Recurring appointments
    toggleRecurringAppointment: function(isRecurring) {
      state.recurringAppointment = isRecurring;
      renderCustomFields();
    },
    
    updateRecurringFrequency: function(frequency) {
      state.recurringFrequency = frequency;
    },
    
    // User account
    showLoginForm: function() {
      // Implement login form display logic
      alert('Login form would appear here');
    },
    
    showSignupForm: function() {
      // Implement signup form display logic
      alert('Signup form would appear here');
    },
    
    viewBookingHistory: function() {
      // Implement booking history view
      if (state.appointmentHistory.length > 0) {
        alert(`You have ${state.appointmentHistory.length} previous bookings`);
      } else {
        alert('You have no previous bookings');
      }
    },
    
    // Navigation
    goToStep: function(step) {
      // Validate if we can move to this step
      if (step === 'staff' && (!state.selectedService || !state.selectedDate || !state.selectedTime)) {
        alert('Please select a service, date, and time first');
        return;
      }
      
      if (step === 'pet' && (!state.selectedService || !state.selectedDate || !state.selectedTime)) {
        alert('Please select a service, date, and time first');
        return;
      }
      
      if (step === 'custom-fields' && !state.selectedPet) {
        alert('Please select a pet first');
        return;
      }
      
      if (step === 'details' && config.features.enableCustomForms) {
        // Validate custom form fields if this step is being skipped
        const customFields = state.formFields[state.selectedService] || [];
        const requiredFields = customFields.filter(field => field.required);
        
        let allRequiredFieldsCompleted = true;
        
        for (const field of requiredFields) {
          if (!state.formResponses[field.id]) {
            allRequiredFieldsCompleted = false;
            break;
          }
        }
        
        if (!allRequiredFieldsCompleted) {
          alert('Please complete all required fields');
          return;
        }
      }
      
      state.step = step;
      renderWidget();
    },
    
    submitBooking: function() {
      // Show loading state
      const submitButton = document.querySelector('.ds-submit-booking');
      if (submitButton) {
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = `<span class="ds-spinner"></span> Processing...`;
        submitButton.disabled = true;
        
        // Add spinner styles
        const style = document.createElement('style');
        style.textContent = `
          .ds-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: ds-spin 1s linear infinite;
            margin-right: 8px;
            vertical-align: text-bottom;
          }
          @keyframes ds-spin {
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Collect form data
      const firstName = document.getElementById('ds-customer-first-name')?.value;
      const lastName = document.getElementById('ds-customer-last-name')?.value;
      const email = document.getElementById('ds-customer-email')?.value;
      const phone = document.getElementById('ds-customer-phone')?.value;
      const notes = document.getElementById('ds-booking-notes')?.value;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !phone) {
        alert('Please fill in all required fields.');
        if (submitButton) {
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;
        }
        return;
      }
      
      // Build booking data
      const bookingData = {
        serviceId: state.selectedService,
        date: state.selectedDate,
        time: state.selectedTime,
        staffId: state.selectedStaff,
        petId: state.selectedPet,
        customer: {
          firstName,
          lastName,
          email,
          phone
        },
        notes,
        formResponses: state.formResponses,
        recurringAppointment: state.recurringAppointment,
        recurringFrequency: state.recurringFrequency
      };
      
      // Save user info for returning users
      try {
        localStorage.setItem('bp-user-info', JSON.stringify({
          firstName,
          lastName,
          email,
          phone
        }));
      } catch (e) {
        console.warn('Could not save user info to localStorage', e);
      }
      
      // In a real implementation, this would submit the booking to the server
      console.log('Submitting booking:', bookingData);
      
      // For the demo, we'll just move to the confirmation step after a delay
      setTimeout(() => {
        // Add to booking history
        state.appointmentHistory.push({
          id: 'booking-' + Date.now(),
          serviceId: state.selectedService,
          date: state.selectedDate,
          time: state.selectedTime,
          timestamp: Date.now()
        });
        
        // Save booking history
        try {
          localStorage.setItem('bp-booking-history', JSON.stringify(state.appointmentHistory));
        } catch (e) {
          console.warn('Could not save booking history to localStorage', e);
        }
        
        state.step = 'confirmation';
        renderWidget();
      }, 1500);
    },
    
    startNewBooking: function() {
      // Reset state
      state.selectedService = null;
      state.selectedDate = null;
      state.selectedTime = null;
      state.selectedStaff = null;
      state.selectedPet = null;
      state.showNewPetForm = false;
      state.formResponses = {};
      state.recurringAppointment = false;
      state.step = 'services';
      
      // Render the widget
      renderWidget();
    }
  };
  
  // Initialize the widget when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();