/**
 * Widget Integration Utilities
 * 
 * This file contains functions for generating, validating, and managing
 * widget integrations for third-party business websites.
 */

const supabase = require('../config/supabase');

/**
 * Generate a unique API key for a business
 * @param {string} businessId - The ID of the business user
 * @param {string} keyName - The name for this API key
 * @returns {string} - The generated API key
 */
exports.generateApiKey = async (businessId, keyName = 'Widget API Key') => {
  try {
    // Call Supabase RPC function to generate API key
    const { data, error } = await supabase.rpc('generate_api_key', {
      business_id: businessId,
      key_name: keyName
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    throw new Error('Error generating API key: ' + error.message);
  }
};

/**
 * Revoke an API key
 * @param {string} keyId - The ID of the API key to revoke
 * @returns {boolean} - Whether the operation was successful
 */
exports.revokeApiKey = async (keyId) => {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);
    
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    throw new Error('Error revoking API key: ' + error.message);
  }
};

/**
 * Validate a widget request from a third-party site
 * @param {string} apiKey - The API key sent by the third-party site
 * @returns {Object|null} - The business user or null if invalid
 */
exports.validateWidgetRequest = async (apiKey) => {
  try {
    // Find business by API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*, users:business_id(*)')
      .eq('key_value', apiKey)
      .single();
    
    if (keyError || !keyData) {
      return null;
    }
    
    // Check if the business exists and is active
    if (!keyData.users || keyData.users.role !== 'business') {
      return null;
    }
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', keyData.id);
    
    return keyData.users;
  } catch (error) {
    return null;
  }
};

/**
 * Generates the widget embed code for a business
 * @param {string} businessId - The ID of the business
 * @param {Object} options - Widget customization options
 * @returns {string} The embed code
 */
exports.generateEmbedCode = async (businessId, options = {}) => {
  try {
    // Get the business details
    const { data: business, error: businessError } = await supabase
      .from('users')
      .select('*')
      .eq('id', businessId)
      .eq('role', 'business')
      .single();
    
    if (businessError) throw new Error('Business not found');
    
    // Get widget settings
    const { data: widgetSettings, error: settingsError } = await supabase
      .from('widget_settings')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();
    
    // Get API keys
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('business_id', businessId)
      .limit(1);
    
    if (keysError || !apiKeys || apiKeys.length === 0) {
      throw new Error('API key not found for this business');
    }
    
    const apiKey = apiKeys[0].key_value;
    
    // Merge options with widgetSettings
    const settings = {
      ...(widgetSettings || {}),
      ...options
    };
    
    // Generate the embed code
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    const embedCode = `
<div id="dog-services-widget"></div>
<script>
  (function() {
    const script = document.createElement('script');
    script.src = "${serverUrl}/widget.js";
    script.async = true;
    script.onload = function() {
      DogServicesWidget.init({
        apiKey: "${apiKey}",
        containerId: "dog-services-widget",
        businessName: "${business.business_name || business.name}",
        primaryColor: "${settings.primary_color || '#4F46E5'}",
        secondaryColor: "${settings.secondary_color || '#10B981'}",
        fontFamily: "${settings.font_family || 'sans-serif'}",
        borderRadius: "${settings.border_radius || '8px'}",
        layout: "${settings.layout || 'default'}"
      });
    };
    document.head.appendChild(script);
  })();
</script>
`;
    
    return embedCode;
  } catch (error) {
    throw new Error('Error generating embed code: ' + error.message);
  }
};

/**
 * Validates an API key and returns business information
 * @param {string} apiKey - The API key to validate
 * @returns {Object} Business information
 */
exports.validateApiKey = async (apiKey) => {
  try {
    // Get API key record
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*, users:business_id(*)')
      .eq('key_value', apiKey)
      .single();
    
    if (keyError) throw new Error('Invalid API key');
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', keyData.id);
    
    // Format business info for response
    const businessInfo = {
      id: keyData.users.id,
      name: keyData.users.business_name || keyData.users.name,
      category: keyData.users.business_category,
      description: keyData.users.business_description
    };
    
    return businessInfo;
  } catch (error) {
    throw error;
  }
};

/**
 * Gets available services for a business
 * @param {string} businessId - The ID of the business
 * @returns {Array} List of services
 */
exports.getBusinessServices = async (businessId) => {
  try {
    // Get services for the business
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', businessId);
    
    if (error) throw error;
    
    return services;
  } catch (error) {
    throw error;
  }
};

/**
 * Gets availability for a service
 * @param {string} serviceId - The ID of the service
 * @returns {Object} Service with availability
 */
exports.getServiceAvailability = async (serviceId) => {
  try {
    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
    
    if (serviceError) throw serviceError;
    
    // Get availability
    const { data: availability, error: availabilityError } = await supabase
      .from('service_availability')
      .select('*')
      .eq('service_id', serviceId);
    
    if (availabilityError) throw availabilityError;
    
    // Get existing bookings to check conflicts
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('service_id', serviceId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', today.toISOString())
      .lte('start_time', nextMonth.toISOString());
    
    if (bookingsError) throw bookingsError;
    
    return {
      service,
      availability,
      bookedSlots: bookings
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a booking from the widget
 * @param {Object} bookingData - The booking data
 * @returns {Object} The created booking
 */
exports.createWidgetBooking = async (bookingData) => {
  try {
    // Get service details to verify business ID
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('provider_id, title, price_amount, price_currency')
      .eq('id', bookingData.service_id)
      .single();
    
    if (serviceError) throw new Error('Service not found');
    
    // Verify business ID matches the service provider
    if (service.provider_id !== bookingData.provider_id) {
      throw new Error('Service does not belong to this provider');
    }
    
    // Format booking data
    const booking = {
      service_id: bookingData.service_id,
      provider_id: service.provider_id,
      client_id: bookingData.client_id,
      pet_id: bookingData.pet_id,
      start_time: new Date(bookingData.start_time).toISOString(),
      end_time: new Date(bookingData.end_time).toISOString(),
      location: bookingData.location,
      total_price_amount: service.price_amount,
      total_price_currency: service.price_currency,
      custom_form_data: bookingData.custom_form_data || null,
      client_notes: bookingData.notes || null,
      status: 'pending'
    };
    
    // Create booking
    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) throw error;
    
    return newBooking;
  } catch (error) {
    throw error;
  }
};