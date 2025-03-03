import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const WidgetIntegration = () => {
  const [apiKey, setApiKey] = useState('dg_widget_key_2CJHB5T8qkLFPmZx1Rv4');
  const [apiSecret, setApiSecret] = useState('dg_widget_secret_XHn3KpL6wGm8jQfDb9VzYa7tRsE1o5');
  const [customizations, setCustomizations] = useState({
    primaryColor: '#4a90e2',
    textColor: '#333333',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '8px'
  });
  
  // Handle customization changes
  const handleCustomizationChange = (field, value) => {
    setCustomizations({
      ...customizations,
      [field]: value
    });
  };
  
  // Generate new API key
  const handleGenerateNewKey = () => {
    const newKey = 'dg_widget_key_' + Math.random().toString(36).substring(2, 15);
    const newSecret = 'dg_widget_secret_' + Math.random().toString(36).substring(2, 30);
    
    setApiKey(newKey);
    setApiSecret(newSecret);
    
    toast.success('New API key generated successfully');
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    toast.success(message || 'Copied to clipboard!');
  };
  
  // Generate the widget embed code based on current settings
  const generateEmbedCode = () => {
    return `<!-- Dog Services Widget -->
<div id="dog-services-widget"></div>
<script>
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://api.dogservices.com/widget.js";
    js.setAttribute('data-api-key', '${apiKey}');
    js.setAttribute('data-color', '${customizations.primaryColor}');
    js.setAttribute('data-text-color', '${customizations.textColor}');
    js.setAttribute('data-font-family', '${customizations.fontFamily}');
    js.setAttribute('data-border-radius', '${customizations.borderRadius}');
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'dog-services-widget-js'));
</script>
<!-- End Dog Services Widget -->`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Widget Integration</h1>
          <p className="page-description">
            Integrate the booking widget into your website
          </p>
        </div>
        
        <div className="header-actions">
          <Link to="/widget-preview" className="btn btn-secondary" target="_blank">
            <span className="btn-icon">👁️</span>
            Preview Widget
          </Link>
        </div>
      </div>
      
      {/* API Keys Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">API Credentials</h2>
          <div className="card-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleGenerateNewKey}
            >
              <span className="btn-icon">🔄</span>
              Generate New Key
            </button>
          </div>
        </div>
        
        <div className="card-body">
          <p className="mb-3">
            These credentials are required to authenticate your website with our booking system.
            Keep your API secret secure and never share it publicly.
          </p>
          
          <div className="api-key-display">
            <div>
              <strong>API Key:</strong>
              <div className="api-key-value mt-1">{apiKey}</div>
            </div>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => copyToClipboard(apiKey, 'API Key copied!')}
            >
              Copy
            </button>
          </div>
          
          <div className="api-key-display">
            <div>
              <strong>API Secret:</strong>
              <div className="api-key-value mt-1">{apiSecret}</div>
            </div>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => copyToClipboard(apiSecret, 'API Secret copied!')}
            >
              Copy
            </button>
          </div>
          
          <div className="mt-3" style={{ color: 'var(--warning-color)' }}>
            <strong>Important:</strong> If you generate a new API key, all previous keys will be invalidated, 
            and you'll need to update the widget code on your website.
          </div>
        </div>
      </div>
      
      {/* Widget Customization */}
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">Widget Customization</h2>
        </div>
        
        <div className="card-body">
          <p className="mb-3">
            Customize the appearance of your widget to match your website's design.
          </p>
          
          <div className="customization-options">
            <div className="form-group">
              <label className="form-label">Primary Color</label>
              <div className="color-picker-container">
                <div 
                  className="color-preview" 
                  style={{ backgroundColor: customizations.primaryColor }}
                ></div>
                <input 
                  type="text" 
                  className="form-control" 
                  value={customizations.primaryColor}
                  onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Text Color</label>
              <div className="color-picker-container">
                <div 
                  className="color-preview" 
                  style={{ backgroundColor: customizations.textColor }}
                ></div>
                <input 
                  type="text" 
                  className="form-control" 
                  value={customizations.textColor}
                  onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Font Family</label>
              <select 
                className="form-control"
                value={customizations.fontFamily}
                onChange={(e) => handleCustomizationChange('fontFamily', e.target.value)}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Lato', sans-serif">Lato</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Border Radius</label>
              <select 
                className="form-control"
                value={customizations.borderRadius}
                onChange={(e) => handleCustomizationChange('borderRadius', e.target.value)}
              >
                <option value="0">None (0px)</option>
                <option value="4px">Slight (4px)</option>
                <option value="8px">Medium (8px)</option>
                <option value="12px">Rounded (12px)</option>
                <option value="24px">Very Rounded (24px)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Integration Code */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Widget Integration Code</h2>
          <div className="card-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => copyToClipboard(generateEmbedCode(), 'Widget code copied!')}
            >
              <span className="btn-icon">📋</span>
              Copy Code
            </button>
          </div>
        </div>
        
        <div className="card-body">
          <p className="mb-3">
            Copy and paste this code into your website where you want the booking widget to appear.
          </p>
          
          <div className="code-block" style={{ position: 'relative' }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {generateEmbedCode()}
            </pre>
            <button 
              className="copy-btn"
              onClick={() => copyToClipboard(generateEmbedCode(), 'Widget code copied!')}
            >
              Copy
            </button>
          </div>
          
          <div className="mt-4">
            <h3 className="integration-heading">Installation Instructions</h3>
            <ol>
              <li className="mb-2">Copy the code snippet above.</li>
              <li className="mb-2">Paste it into the HTML of your website where you want the widget to appear.</li>
              <li className="mb-2">Save the changes to your website.</li>
              <li className="mb-2">Test the widget by visiting your website and making a test booking.</li>
            </ol>
          </div>
          
          <div className="mt-4">
            <h3 className="integration-heading">Server-Side Integration (Recommended)</h3>
            <p>
              For enhanced security, we recommend implementing a server-side signature validation. 
              This prevents unauthorized use of your widget and protects your API credentials.
            </p>
            <div className="code-block" style={{ position: 'relative' }}>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
{`// Server-side code (Node.js example)
const crypto = require('crypto');

function generateWidgetSignature(apiSecret, payload) {
  return crypto
    .createHmac('sha256', apiSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

// Example payload
const payload = {
  timestamp: Date.now(),
  origin: 'https://yourwebsite.com'
};

const signature = generateWidgetSignature('${apiSecret}', payload);

// Return this signature to your frontend
// to include in the widget initialization`}
              </pre>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(`// Server-side code (Node.js example)
const crypto = require('crypto');

function generateWidgetSignature(apiSecret, payload) {
  return crypto
    .createHmac('sha256', apiSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

// Example payload
const payload = {
  timestamp: Date.now(),
  origin: 'https://yourwebsite.com'
};

const signature = generateWidgetSignature('${apiSecret}', payload);

// Return this signature to your frontend
// to include in the widget initialization`, 'Server-side code copied!')}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetIntegration;