const express = require('express');
const router = express.Router();
const { authenticate, isServiceProvider } = require('../middlewares/auth');
const widgetIntegration = require('../utils/widgetIntegration');

/**
 * Generate API key for widget integration
 * POST /api/widget/api-key
 * Required role: service_provider
 */
router.post('/api-key', authenticate, isServiceProvider, async (req, res) => {
  try {
    const apiCredentials = await widgetIntegration.generateApiKey(req.user.userId);
    
    res.status(201).json({
      message: 'API credentials generated successfully',
      apiCredentials
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get widget embed code
 * GET /api/widget/embed-code
 * Required role: service_provider
 */
router.get('/embed-code', authenticate, isServiceProvider, async (req, res) => {
  try {
    // Find the user's API key
    const user = await require('../models/User').findById(req.user.userId);
    const apiKey = user?.apiCredentials?.key;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'No API key found. Please generate an API key first.' 
      });
    }
    
    const embedCode = await widgetIntegration.getEmbedCode(apiKey);
    
    res.status(200).json({
      message: 'Embed code generated successfully',
      embedCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get widget session token
 * POST /api/widget/token
 * Public endpoint for third-party sites
 */
router.post('/token', async (req, res) => {
  try {
    const { apiKey, signature, payload, customization } = req.body;
    
    // Validate the request
    const isValid = await widgetIntegration.validateWidgetRequest(
      apiKey, 
      signature, 
      payload
    );
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid widget request' });
    }
    
    // Generate widget token
    const token = await widgetIntegration.generateWidgetToken(apiKey, customization);
    
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify widget token
 * GET /api/widget/verify-token
 * Intended for the widget to verify its token is valid
 */
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token
    const decoded = require('jsonwebtoken').verify(
      token, 
      process.env.JWT_SECRET
    );
    
    // Check if it's a widget token
    if (!decoded.widget) {
      return res.status(401).json({ error: 'Invalid widget token' });
    }
    
    res.status(200).json({
      valid: true,
      providerId: decoded.providerId,
      customization: decoded.customization || {}
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', valid: false });
  }
});

/**
 * Get widget available services
 * GET /api/widget/services
 * Requires widget token
 */
router.get('/services', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token
    const decoded = require('jsonwebtoken').verify(
      token, 
      process.env.JWT_SECRET
    );
    
    // Check if it's a widget token
    if (!decoded.widget) {
      return res.status(401).json({ error: 'Invalid widget token' });
    }
    
    // Get services for this provider
    const services = await require('../models/Service').find({
      provider: decoded.providerId,
      isPaused: false
    });
    
    res.status(200).json({ services });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;