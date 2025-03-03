/**
 * Widget Integration Utilities
 * 
 * This file contains functions for generating, validating, and managing
 * the dog services widget integrations for third-party websites.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

/**
 * Generate a unique API key for a service provider
 * @param {String} userId - The ID of the service provider
 * @returns {Object} - API key and secret
 */
exports.generateApiKey = async (userId) => {
  try {
    // Generate random API key and secret
    const apiKey = crypto.randomBytes(16).toString('hex');
    const apiSecret = crypto.randomBytes(32).toString('hex');

    // Store API credentials with the user
    await User.findByIdAndUpdate(userId, {
      'apiCredentials.key': apiKey,
      'apiCredentials.secret': apiSecret,
      'apiCredentials.createdAt': new Date()
    });

    return {
      apiKey,
      apiSecret
    };
  } catch (error) {
    throw new Error('Error generating API credentials: ' + error.message);
  }
};

/**
 * Validate a widget request from a third-party site
 * @param {String} apiKey - The API key sent by the third-party site
 * @param {String} signature - The request signature 
 * @param {Object} payload - The request payload
 * @returns {Boolean} - Whether the request is valid
 */
exports.validateWidgetRequest = async (apiKey, signature, payload) => {
  try {
    // Find user by API key
    const user = await User.findOne({ 'apiCredentials.key': apiKey });
    if (!user) {
      return false;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', user.apiCredentials.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
};

/**
 * Generate a session token for embedded widget
 * @param {String} apiKey - The API key of the service provider
 * @param {Object} customization - Widget customization options
 * @returns {String} - JWT token for widget initialization
 */
exports.generateWidgetToken = async (apiKey, customization = {}) => {
  try {
    // Find user by API key
    const user = await User.findOne({ 'apiCredentials.key': apiKey });
    if (!user) {
      throw new Error('Invalid API key');
    }

    // Ensure user is a service provider
    if (user.role !== 'service_provider') {
      throw new Error('API key must belong to a service provider');
    }

    // Generate widget token
    const token = jwt.sign(
      { 
        providerId: user._id,
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
 * @param {String} apiKey - The API key of the service provider
 * @returns {String} - HTML/JS code for embedding the widget
 */
exports.getEmbedCode = async (apiKey) => {
  try {
    // Find user by API key to verify it exists
    const user = await User.findOne({ 'apiCredentials.key': apiKey });
    if (!user) {
      throw new Error('Invalid API key');
    }

    // Return embed code with API key included
    return `
<!-- Dog Services Widget -->
<div id="dog-services-widget"></div>
<script>
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "${process.env.API_URL || 'https://api.dogservices.com'}/widget.js";
    js.setAttribute('data-api-key', '${apiKey}');
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'dog-services-widget-js'));
</script>
<!-- End Dog Services Widget -->
    `;
  } catch (error) {
    throw new Error('Error generating embed code: ' + error.message);
  }
};