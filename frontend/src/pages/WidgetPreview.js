import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const WidgetPreview = () => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for the widget content - in a real app this would be loaded from backend
  const widgetSrc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Preview</title>
  <style>
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <div id="dog-services-widget" style="width: 100%;"></div>
  
  <script>
    // This is a self-contained demo version of the widget script for preview purposes
    
    // Widget configuration
    const config = {
      apiUrl: 'https://api.dogservices.com',
      containerId: 'dog-services-widget',
      apiKey: 'demo-key',
      token: 'demo-token',
      customization: {
        primaryColor: '#4a90e2',
        textColor: '#333333',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        borderRadius: '8px',
      }
    };
  
    // Widget state
    let state = {
      initialized: true,
      services: [
        {
          _id: 'serv-1',
          title: 'Premium Dog Grooming',
          description: 'Full service grooming including bath, haircut, nail trimming, and ear cleaning.',
          category: 'grooming',
          price: { amount: 65, currency: 'USD' },
          duration: 90
        },
        {
          _id: 'serv-2',
          title: 'Bath & Brush',
          description: 'Bath, blow dry, brush out, ear cleaning, and nail trim.',
          category: 'grooming',
          price: { amount: 45, currency: 'USD' },
          duration: 60
        },
        {
          _id: 'serv-3',
          title: 'Dog Walking',
          description: 'Professional dog walking service for your furry friend.',
          category: 'walking',
          price: { amount: 25, currency: 'USD' },
          duration: 30
        },
        {
          _id: 'serv-4',
          title: 'Nail Trimming',
          description: 'Quick and stress-free nail trimming service.',
          category: 'grooming',
          price: { amount: 15, currency: 'USD' },
          duration: 15
        }
      ],
      selectedService: null,
      selectedDate: null,
      selectedTime: null,
      selectedPet: null,
      pets: [],
      step: 'services', // services, datetime, pet, details, confirmation
      user: null,
      isLoggedIn: false,
      showNewPetForm: false
    };
    
    // Include the full widget.js script content here
    ${document.querySelector('script[src$="widget.js"]')?.textContent || `
      // Render services list
      function renderServicesList() {
        const container = document.getElementById(config.containerId);
        
        if (!container) return;
        
        let html = \`
          <div class="ds-widget-header" style="text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid \${config.customization.primaryColor}20;">
            <h2 style="color: \${config.customization.primaryColor}; margin-bottom: 5px; font-size: 22px;">Schedule an Appointment</h2>
            <p style="color: #666;">Select service type to continue</p>
          </div>
          <div class="ds-services-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
        \`;
        
        if (state.services.length === 0) {
          html += \`<p style="text-align: center; grid-column: 1/-1;">No services available at this time.</p>\`;
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
            
            html += \`
              <div class="ds-service-item" 
                   style="padding: 15px; border: 1px solid #eee; 
                          border-radius: \${config.customization.borderRadius}; cursor: pointer;
                          background: white; transition: transform 0.2s, box-shadow 0.2s;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.05);"
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.1)';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)';"
                   onclick="selectService('\${service._id}')">
                <div style="font-size: 28px; margin-bottom: 10px; text-align: center;">\${icon}</div>
                <h3 style="margin-top: 0; color: \${config.customization.primaryColor}; text-align: center; font-size: 16px;">
                  \${service.title}
                </h3>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; font-size: 14px;">
                  <span style="font-weight: bold;">
                    $\${service.price.amount}
                  </span>
                  <span style="color: #666;">
                    \${service.duration} min
                  </span>
                </div>
              </div>
            \`;
          });
        }
        
        html += \`
          </div>
          <div class="ds-widget-footer" style="text-align: center; margin-top: 25px; font-size: 12px; color: #999;">
            <p>Book appointments online 24/7</p>
          </div>
        \`;
        
        container.innerHTML = html;
      }
      
      // This would be part of the widget script, simplified for demo
      function selectService(serviceId) {
        state.selectedService = serviceId;
        state.step = 'datetime';
        renderWidget();
      }
      
      // Simple version of the full widget renderer for preview
      function renderWidget() {
        if (state.step === 'services') {
          renderServicesList();
        } else {
          const container = document.getElementById(config.containerId);
          if (!container) return;
          
          container.innerHTML = \`
            <div style="text-align: center; padding: 50px 20px;">
              <h2 style="color: \${config.customization.primaryColor};">Step: \${state.step}</h2>
              <p>This is a preview of the widget functionality.</p>
              <p>In the actual widget, this would show the \${state.step} interface.</p>
              <button 
                style="padding: 10px 20px; background-color: \${config.customization.primaryColor}; color: white; border: none; border-radius: \${config.customization.borderRadius}; cursor: pointer; margin-top: 20px;"
                onclick="resetWidget()">
                Back to Services
              </button>
            </div>
          \`;
        }
      }
      
      function resetWidget() {
        state.selectedService = null;
        state.step = 'services';
        renderWidget();
      }
      
      // Initialize the widget
      document.addEventListener('DOMContentLoaded', function() {
        renderWidget();
        window.parent.postMessage('widget:loaded', '*');
      });
    `}
  </script>
</body>
</html>
  `;
  
  useEffect(() => {
    if (iframeRef.current) {
      const handleIframeLoad = () => {
        setIsLoading(false);
      };
      
      const handleMessage = (event) => {
        if (event.data === 'widget:loaded') {
          setIsLoading(false);
        }
      };
      
      window.addEventListener('message', handleMessage);
      iframeRef.current.addEventListener('load', handleIframeLoad);
      
      // Set iframe content
      const iframeDocument = iframeRef.current.contentDocument || 
                           (iframeRef.current.contentWindow && iframeRef.current.contentWindow.document);
      
      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(widgetSrc);
        iframeDocument.close();
      }
      
      return () => {
        window.removeEventListener('message', handleMessage);
        if (iframeRef.current) {
          iframeRef.current.removeEventListener('load', handleIframeLoad);
        }
      };
    }
  }, [widgetSrc]);

  return (
    <div className="widget-preview-container">
      <div className="widget-preview-header">
        <h1 className="page-title">Widget Preview</h1>
        <p className="page-description">
          This is how your booking widget will appear to your customers when embedded on your website.
        </p>
      </div>
      
      <div className="widget-preview-frame-container" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
        {isLoading && (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10
          }}>
            <div className="spinner"></div>
          </div>
        )}
        
        <iframe 
          ref={iframeRef}
          className="widget-preview-frame"
          title="Widget Preview"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
      
      <div className="widget-preview-controls">
        <Link to="/widget-integration" className="btn btn-primary">
          Customize Widget
        </Link>
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--medium-text)' }}>
          This is a preview of how the widget will appear on your website. Interact with it to see the booking flow.
        </p>
      </div>
    </div>
  );
};

export default WidgetPreview;