/**
 * Dog Services Booking Widget
 * 
 * This script creates an embeddable booking widget for dog service providers.
 * It loads within the host website and communicates with the Dog Services API.
 */

(function() {
  // Widget configuration
  const config = {
    apiUrl: 'https://api.dogservices.com',
    containerId: 'dog-services-widget',
    apiKey: null,
    token: null,
    customization: {
      primaryColor: '#4a90e2',
      textColor: '#333333',
      fontFamily: 'Arial, sans-serif',
      borderRadius: '8px',
    }
  };

  // Widget state
  let state = {
    initialized: false,
    services: [],
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    selectedPet: null,
    pets: [],
    step: 'services', // services, datetime, pet, details, confirmation
    user: null,
    isLoggedIn: false
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
    const customColor = currentScript.getAttribute('data-color');
    if (customColor) config.customization.primaryColor = customColor;
    
    // Create and initialize the widget container
    createWidgetContainer();
    
    // Request a token from the server
    requestToken();
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

  // Create widget container
  function createWidgetContainer() {
    const container = document.getElementById(config.containerId);
    
    if (!container) {
      console.error(`Dog Services Widget: Container #${config.containerId} not found`);
      return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Set container styles
    container.style.fontFamily = config.customization.fontFamily;
    container.style.color = config.customization.textColor;
    container.style.border = `1px solid ${config.customization.primaryColor}30`;
    container.style.borderRadius = config.customization.borderRadius;
    container.style.padding = '20px';
    container.style.maxWidth = '500px';
    container.style.margin = '0 auto';
    container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    
    // Show loading indicator
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p>Loading Dog Services booking widget...</p>
      </div>
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

  // Render services list
  function renderServicesList() {
    const container = document.getElementById(config.containerId);
    
    if (!container) return;
    
    let html = `
      <div class="ds-widget-header" style="text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${config.customization.primaryColor}20;">
        <h2 style="color: ${config.customization.primaryColor}; margin-bottom: 5px; font-size: 22px;">Schedule an Appointment</h2>
        <p style="color: #666;">Select service type to continue</p>
      </div>
      <div class="ds-services-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
    `;
    
    if (state.services.length === 0) {
      html += `<p style="text-align: center; grid-column: 1/-1;">No services available at this time.</p>`;
    } else {
      state.services.forEach(service => {
        // Determine icon based on category
        let icon = '🐾';
        switch(service.category) {
          case 'grooming': icon = '✂️'; break;
          case 'walking': icon = '🚶‍♂️'; break;
          case 'boarding': icon = '🏠'; break;
          case 'daycare': icon = '🏢'; break;
          case 'training': icon = '🎓'; break;
          case 'sitting': icon = '👥'; break;
        }
        
        html += `
          <div class="ds-service-item" 
               style="padding: 15px; border: 1px solid #eee; 
                      border-radius: ${config.customization.borderRadius}; cursor: pointer;
                      background: white; transition: transform 0.2s, box-shadow 0.2s;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.05);"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.1)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)';"
               onclick="window.DogServicesWidget.selectService('${service._id}')">
            <div style="font-size: 28px; margin-bottom: 10px; text-align: center;">${icon}</div>
            <h3 style="margin-top: 0; color: ${config.customization.primaryColor}; text-align: center; font-size: 16px;">
              ${service.title}
            </h3>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; font-size: 14px;">
              <span style="font-weight: bold;">
                $${service.price.amount}
              </span>
              <span style="color: #666;">
                ${service.duration} min
              </span>
            </div>
          </div>
        `;
      });
    }
    
    html += `
      </div>
      <div class="ds-widget-footer" style="text-align: center; margin-top: 25px; font-size: 12px; color: #999;">
        <p>Book appointments online 24/7</p>
      </div>
    `;
    
    container.innerHTML = html;
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

  // Public API methods
  window.DogServicesWidget = {
    init: init,
    
    selectService: function(serviceId) {
      state.selectedService = serviceId;
      state.step = 'datetime';
      renderWidget();
    },
    
    selectDate: function(date) {
      state.selectedDate = date;
      state.selectedTime = null; // Reset time when date changes
      renderDateTimePicker();
    },
    
    selectTime: function(time) {
      state.selectedTime = time;
      renderDateTimePicker();
    },
    
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
      
      // Render pet selector with new pet
      renderPetSelector();
    },
    
    goToStep: function(step) {
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
      const name = document.getElementById('ds-customer-name')?.value;
      const email = document.getElementById('ds-customer-email')?.value;
      const phone = document.getElementById('ds-customer-phone')?.value;
      const notes = document.getElementById('ds-booking-notes')?.value;
      
      // Validate required fields
      if (!name || !email || !phone) {
        alert('Please fill in all required fields.');
        if (submitButton) {
          submitButton.innerHTML = originalText;
          submitButton.disabled = false;
        }
        return;
      }
      
      // In a real implementation, this would submit the booking to the server
      // For the demo, we'll just move to the confirmation step after a delay
      setTimeout(() => {
        state.step = 'confirmation';
        renderWidget();
      }, 1500);
    },
    
    startNewBooking: function() {
      // Reset state
      state.selectedService = null;
      state.selectedDate = null;
      state.selectedTime = null;
      state.selectedPet = null;
      state.showNewPetForm = false;
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