const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed. User not found.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Authentication failed. Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Authentication failed. Token expired.' });
    }
    next(error);
  }
};

// Middleware to check if user is a business
exports.isBusiness = (req, res, next) => {
  if (req.user.role !== 'business' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Business role required.' });
  }
  next();
};

// Middleware to check if user is a client
exports.isClient = (req, res, next) => {
  if (req.user.role !== 'client' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Client role required.' });
  }
  next();
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Middleware to check if user owns a business
exports.isBusinessOwner = async (req, res, next) => {
  try {
    const businessId = req.params.businessId || req.body.businessId;
    
    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required.' });
    }
    
    const business = await User.findById(businessId);
    
    if (!business || business.role !== 'business') {
      return res.status(404).json({ error: 'Business not found.' });
    }
    
    if (business._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You are not the owner of this business.' });
    }
    
    req.business = business;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user owns a resource
exports.isResourceOwner = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found.' });
      }

      // Check if owner property exists and matches user id
      const ownerId = resource.owner || resource.provider || resource.client;
      
      if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
        // Allow admins to access any resource
        if (req.user.role === 'admin') {
          return next();
        }
        return res.status(403).json({ error: 'Access denied. You do not own this resource.' });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to verify API key for widget
exports.verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required.' });
    }
    
    const business = await User.findOne({
      'apiKeys.key': apiKey,
      role: 'business'
    });
    
    if (!business) {
      return res.status(401).json({ error: 'Invalid API key.' });
    }
    
    // Update lastUsed timestamp for the API key
    const keyIndex = business.apiKeys.findIndex(k => k.key === apiKey);
    if (keyIndex !== -1) {
      business.apiKeys[keyIndex].lastUsed = new Date();
      await business.save();
    }
    
    req.business = business;
    next();
  } catch (error) {
    next(error);
  }
};