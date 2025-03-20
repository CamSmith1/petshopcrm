const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const supabase = require('../config/supabase');

/**
 * @route   GET /api/customers
 * @desc    Get all customers for the business
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Only business can access their customers
    if (req.user.role !== 'business') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'client');
    
    // Filter by business - clients who have booked with this business
    const { data: clientIds, error: bookingError } = await supabase
      .from('bookings')
      .select('client_id')
      .eq('business_id', req.user.businessId)
      .limit(1000);
    
    if (bookingError) {
      console.error('Error fetching client IDs from bookings:', bookingError);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
    
    if (clientIds && clientIds.length > 0) {
      const uniqueClientIds = [...new Set(clientIds.map(b => b.client_id))];
      query = query.in('id', uniqueClientIds);
    } else {
      // No bookings yet
      return res.json({ customers: [] });
    }
    
    // Apply search filter if provided
    if (req.query.search) {
      query = query.or(
        `name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%,phone.ilike.%${req.query.search}%`
      );
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
    
    return res.json({ customers: data });
  } catch (err) {
    console.error('Error in customers fetch:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/customers/:id
 * @desc    Get a specific customer
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'client')
      .single();
    
    if (error) {
      console.error('Error fetching customer:', error);
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if customer has booked with this business
    if (req.user.role === 'business') {
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('client_id', id)
        .eq('business_id', req.user.businessId)
        .limit(1);
      
      if (bookingError || !bookings || bookings.length === 0) {
        return res.status(403).json({ error: 'Unauthorized access to customer data' });
      }
    }
    
    return res.json({ customer: data });
  } catch (err) {
    console.error('Error in customer fetch:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/customers
 * @desc    Create or update a customer
 * @access  Public (for booking page)
 */
router.post('/', async (req, res) => {
  try {
    console.log('[CUSTOMER DEBUG] Creating/updating customer - Request body:', req.body);
    const { name, email, phone, street, city, state, zip_code, country, custom_fields } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      console.log('[CUSTOMER DEBUG] Validation failed: Missing name or email');
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    console.log('[CUSTOMER DEBUG] Checking if user exists with email:', email);
    // Check if customer already exists by email
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);
    
    if (fetchError) {
      console.error('[CUSTOMER DEBUG] Error checking for existing user:', fetchError);
      return res.status(500).json({ error: 'Error checking for existing user' });
    }
    
    console.log('[CUSTOMER DEBUG] Existing user check result:', existingUser ? `Found ${existingUser.length} users` : 'No users found');
    
    let customer;
    
    if (existingUser && existingUser.length > 0) {
      console.log('[CUSTOMER DEBUG] Updating existing user with ID:', existingUser[0].id);
      
      const updateData = {
        name,
        phone: phone || existingUser[0].phone,
        street: street || existingUser[0].street,
        city: city || existingUser[0].city,
        state: state || existingUser[0].state,
        zip_code: zip_code || existingUser[0].zip_code,
        country: country || existingUser[0].country,
        custom_fields: JSON.stringify(custom_fields) || existingUser[0].custom_fields,
        updated_at: new Date().toISOString()
      };
      
      console.log('[CUSTOMER DEBUG] Update data:', updateData);
      
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', existingUser[0].id)
        .select()
        .single();
      
      if (error) {
        console.error('[CUSTOMER DEBUG] Error updating customer:', error);
        return res.status(500).json({ error: 'Failed to update customer' });
      }
      
      console.log('[CUSTOMER DEBUG] Customer updated successfully:', data);
      customer = data;
    } else {
      console.log('[CUSTOMER DEBUG] Creating new user with email:', email);
      
      const insertData = {
        name,
        email,
        phone: phone || null,
        street: street || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        country: country || null,
        custom_fields: JSON.stringify(custom_fields) || null,
        role: 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('[CUSTOMER DEBUG] Insert data:', insertData);
      
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('[CUSTOMER DEBUG] Error creating customer:', error);
        return res.status(500).json({ error: 'Failed to create customer', details: error });
      }
      
      console.log('[CUSTOMER DEBUG] Customer created successfully:', data);
      customer = data;
    }
    
    console.log('[CUSTOMER DEBUG] Returning customer data to client');
    return res.status(existingUser && existingUser.length > 0 ? 200 : 201).json({ customer });
  } catch (err) {
    console.error('[CUSTOMER DEBUG] Unexpected error in customer creation/update:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a specific customer
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, street, city, state, zip_code, country, custom_fields } = req.body;
    
    // Only authorized users can update a customer
    if (req.user.role !== 'business' && req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // If email is provided, check if it belongs to another user
    if (email) {
      const { data: existingEmail, error: emailError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .limit(1);
        
      if (emailError) {
        console.error('Error checking email uniqueness:', emailError);
        return res.status(500).json({ error: 'Error checking email uniqueness' });
      }
      
      if (existingEmail && existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
    }
    
    // Update the user
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        phone: phone || null,
        street: street || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        country: country || null,
        custom_fields: JSON.stringify(custom_fields) || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('role', 'client')
      .select()
      .single();
    
    if (error) {
      console.error('Error updating customer:', error);
      return res.status(500).json({ error: 'Failed to update customer' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    return res.json({ customer: data });
  } catch (err) {
    console.error('Error in customer update:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;