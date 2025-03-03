/**
 * Widget Integration Utilities
 * 
 * This file contains functions for generating, validating, and managing
 * widget integrations for third-party business websites.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

/**
 * Generate a unique API key for a business
 * @param {String} userId - The ID of the business user
 * @param {String} keyName - The name for this API key
 * @returns {Object} - API key object
 */
exports.generateApiKey = async (userId, keyName = 'Widget API Key') => {
  try {
    // Generate random API key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apiKey = 'bpro_';
    
    for (let i = 0; i < 32; i++) {
      apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create new API key object
    const newApiKey = {
      key: apiKey,
      name: keyName,
      createdAt: new Date(),
      lastUsed: null
    };

    // Add this key to the user's API keys array
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.apiKeys) {
      user.apiKeys = [];
    }

    user.apiKeys.push(newApiKey);
    await user.save();

    return newApiKey;
  } catch (error) {
    throw new Error('Error generating API key: ' + error.message);
  }
};

/**
 * Revoke an API key
 * @param {String} userId - The ID of the business user
 * @param {String} apiKey - The API key to revoke
 * @returns {Boolean} - Whether the operation was successful
 */
exports.revokeApiKey = async (userId, apiKey) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const keyIndex = user.apiKeys.findIndex(k => k.key === apiKey);
    if (keyIndex === -1) {
      throw new Error('API key not found');
    }

    user.apiKeys.splice(keyIndex, 1);
    await user.save();

    return true;
  } catch (error) {
    throw new Error('Error revoking API key: ' + error.message);
  }
};

/**
 * Validate a widget request from a third-party site
 * @param {String} apiKey - The API key sent by the third-party site
 * @returns {Object|null} - The business user or null if invalid
 */
exports.validateWidgetRequest = async (apiKey) => {
  try {
    // Find business by API key
    const business = await User.findOne({
      'apiKeys.key': apiKey,
      role: 'business'
    });
    
    if (!business) {
      return null;
    }

    // Update last used timestamp
    const keyIndex = business.apiKeys.findIndex(k => k.key === apiKey);
    if (keyIndex !== -1) {
      business.apiKeys[keyIndex].lastUsed = new Date();
      await business.save();
    }

    return business;
  } catch (error) {
    return null;
  }
};

/**
 * Generate a session token for embedded widget
 * @param {String} apiKey - The API key of the business
 * @param {Object} customization - Widget customization options
 * @returns {String} - JWT token for widget initialization
 */
exports.generateWidgetToken = async (apiKey, customization = {}) => {
  try {
    // Find business by API key
    const business = await User.findOne({
      'apiKeys.key': apiKey,
      role: 'business'
    });
    
    if (!business) {
      throw new Error('Invalid API key');
    }

    // Generate widget token
    const token = jwt.sign(
      { 
        businessId: business._id,
        widget: true,
        customization
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return token;
  } catch (error) {
    throw new Error('Error generating widget token: ' + error.message);
  }
};

/**
 * Get embed script code for third-party websites
 * @param {String} apiKey - The API key of the business
 * @param {Object} options - Customization options for the widget
 * @returns {String} - HTML/JS code for embedding the widget
 */
exports.getEmbedCode = async (apiKey, options = {}) => {
  try {
    // Find business by API key to verify it exists
    const business = await User.findOne({
      'apiKeys.key': apiKey,
      role: 'business'
    });
    
    if (!business) {
      throw new Error('Invalid API key');
    }

    // Construct customization parameters
    const customParams = Object.entries(options)
      .map(([key, value]) => `data-${key}="${value}"`)
      .join(' ');

    // Return embed code with API key included
    return `
<!-- BookingPro Widget -->
<div id="bookingpro-widget"></div>
<script>
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "${process.env.API_URL || 'https://api.bookingpro.io'}/widget.js";
    js.setAttribute('data-api-key', '${apiKey}');
    ${customParams ? `js.setAttribute('${customParams}');` : ''}
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'bookingpro-widget-js'));
</script>
<!-- End BookingPro Widget -->
    `;
  } catch (error) {
    throw new Error('Error generating embed code: ' + error.message);
  }
};