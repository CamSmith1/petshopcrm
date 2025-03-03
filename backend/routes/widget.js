const express = require('express');
const router = express.Router();
const { authenticate, isBusiness, verifyApiKey } = require('../middlewares/auth');
const widgetIntegration = require('../utils/widgetIntegration');

/**
 * Generate API key for widget integration
 * POST /api/widget/api-key
 * Required role: business
 */
router.post('/api-key', authenticate, isBusiness, async (req, res) => {
  try {
    const keyName = req.body.name || 'Widget API Key';
    const apiKey = await widgetIntegration.generateApiKey(req.user._id, keyName);
    
    res.status(201).json({
      message: 'API key generated successfully',
      apiKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get widget embed code
 * GET /api/widget/embed-code
 * Required role: business
 */
router.get('/embed-code', authenticate, isBusiness, async (req, res) => {
  try {
    // Find the user's API key
    const user = await require('../models/User').findById(req.user._id);
    const apiKey = req.query.apiKey || (user.apiKeys && user.apiKeys.length > 0 ? user.apiKeys[0].key : null);
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'No API key found. Please generate an API key first.' 
      });
    }
    
    // Get customization options
    const options = {
      primaryColor: req.query.primaryColor || user.widgetSettings?.theme?.primaryColor,
      layout: req.query.layout || user.widgetSettings?.layout
    };
    
    const embedCode = await widgetIntegration.getEmbedCode(apiKey, options);
    
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
    const { apiKey, customization } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Validate API key
    const business = await widgetIntegration.validateWidgetRequest(apiKey);
    
    if (!business) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Generate widget token
    const token = await widgetIntegration.generateWidgetToken(apiKey, customization);
    
    res.status(200).json({ 
      token,
      businessName: business.businessName,
      businessId: business._id
    });
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
      businessId: decoded.businessId,
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
    
    // Get services for this business
    const services = await require('../models/Service').find({
      provider: decoded.businessId,
      isPaused: false
    });
    
    // Get business info
    const business = await require('../models/User').findById(decoded.businessId, 'businessName businessDescription');
    
    res.status(200).json({ 
      services,
      business: {
        id: business._id,
        name: business.businessName,
        description: business.businessDescription
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;