const supabase = require('../config/supabase');
const supabaseClient = require('../utils/supabaseClient');

// Middleware to authenticate user with Supabase
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    try {
      const user = await supabaseClient.auth.verifyToken(token);
      
      // Get user details from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userError || !userData) {
        return res.status(401).json({ error: 'Authentication failed. User not found.' });
      }

      // Attach user to request
      req.user = userData;
      req.user.userId = userData.id; // For compatibility with existing code
      next();
    } catch (tokenError) {
      return res.status(401).json({ error: 'Authentication failed. Invalid token.' });
    }
  } catch (error) {
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
    
    const { data: business, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', businessId)
      .eq('role', 'business')
      .single();
    
    if (error || !business) {
      return res.status(404).json({ error: 'Business not found.' });
    }
    
    if (business.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You are not the owner of this business.' });
    }
    
    req.business = business;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user owns a resource
exports.isResourceOwner = (resourceTable, ownerField = 'owner_id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      
      // Get the resource
      const { data: resource, error } = await supabase
        .from(resourceTable)
        .select('*')
        .eq('id', resourceId)
        .single();
      
      if (error || !resource) {
        return res.status(404).json({ error: 'Resource not found.' });
      }

      // Determine owner field based on the table or supplied parameter
      let actualOwnerField = ownerField;
      if (resourceTable === 'services') {
        actualOwnerField = 'provider_id';
      } else if (resourceTable === 'bookings') {
        // For bookings, check if the user is either the provider or the client
        if (resource.provider_id === req.user.id || resource.client_id === req.user.id || req.user.role === 'admin') {
          req.resource = resource;
          return next();
        } else {
          return res.status(403).json({ error: 'Access denied. You do not own this resource.' });
        }
      }
      
      // Check if user owns the resource
      if (resource[actualOwnerField] !== req.user.id) {
        // Allow admins to access any resource
        if (req.user.role === 'admin') {
          req.resource = resource;
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
    
    // Find the API key in the database
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*, users:business_id(*)')
      .eq('key_value', apiKey)
      .single();
    
    if (keyError || !keyData) {
      return res.status(401).json({ error: 'Invalid API key.' });
    }
    
    // Check if the business exists and is active
    if (!keyData.users || keyData.users.role !== 'business') {
      return res.status(401).json({ error: 'Invalid API key. Business account not found.' });
    }
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used: new Date() })
      .eq('id', keyData.id);
    
    req.business = keyData.users;
    next();
  } catch (error) {
    next(error);
  }
};