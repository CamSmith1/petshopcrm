/**
 * Dog Services Booking Widget
 * Embed this script in your website to provide booking functionality
 */
(function() {
  // Create global widget namespace
  window.dogServicesWidget = window.dogServicesWidget || {};
  
  // Base URL for API requests
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://api.dogservices.com/api';

  // Styles injection
  const injectStyles = () => {
    if (document.getElementById('dog-services-widget-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'dog-services-widget-styles';
    styleSheet.textContent = `
      .ds-widget-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ds-widget-modal {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
      }
      
      .ds-widget-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 10;
      }

      @media (max-width: 600px) {
        .ds-widget-modal {
          max-width: 95%;
        }
      }
    `;
    
    document.head.appendChild(styleSheet);
  };

  // Create iFrame for widget content
  const createWidgetIframe = (businessId, config = {}) => {
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '650px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    
    // URL for iframe content
    const widgetUrl = new URL('/widget-embed', window.location.origin);
    widgetUrl.searchParams.append('businessId', businessId);
    widgetUrl.searchParams.append('config', JSON.stringify(config));
    
    iframe.src = widgetUrl.toString();
    
    return iframe;
  };

  // Create popup modal with widget
  const createModalWidget = (businessId, config = {}) => {
    injectStyles();
    
    const overlay = document.createElement('div');
    overlay.className = 'ds-widget-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'ds-widget-modal';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'ds-widget-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const iframe = createWidgetIframe(businessId, config);
    
    modal.appendChild(closeButton);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    
    document.body.appendChild(overlay);
  };

  // Initialize inline widget
  const initInlineWidget = (options) => {
    const { businessId, containerId, config = {} } = options;
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error(`Dog Services Widget: Container with ID "${containerId}" not found`);
      return;
    }
    
    const iframe = createWidgetIframe(businessId, config);
    container.appendChild(iframe);
  };

  // Initialize popup widget
  const initPopupWidget = (options) => {
    const { businessId, buttonId, config = {} } = options;
    const button = document.getElementById(buttonId);
    
    if (!button) {
      console.error(`Dog Services Widget: Button with ID "${buttonId}" not found`);
      return;
    }
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      createModalWidget(businessId, config);
    });
  };

  // Public initialization function
  window.dogServicesWidget.initialize = (options) => {
    if (!options || !options.businessId) {
      console.error('Dog Services Widget: businessId is required');
      return;
    }
    
    // Initialize based on mode
    if (options.mode === 'popup') {
      initPopupWidget(options);
    } else {
      initInlineWidget(options);
    }
  };
  
  // Setup message listeners for cross-origin communication
  window.addEventListener('message', (event) => {
    // Implement message handling for events from the iframe
    // This can include things like height resizing, closing the modal, etc.
  });

  console.log('Dog Services Booking Widget initialized');
})();