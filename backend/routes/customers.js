const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const supabase = require('../config/supabase');

/**
 * @route   GET /api/customers
 * @desc    Get all customers for the business
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
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
router.get('/:id', auth, async (req, res) => {
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
    const { name, email, phone } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if customer already exists by email
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);
    
    if (fetchError) {
      console.error('Error checking for existing user:', fetchError);
      return res.status(500).json({ error: 'Error checking for existing user' });
    }
    
    let customer;
    
    if (existingUser && existingUser.length > 0) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          name,
          phone: phone || existingUser[0].phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser[0].id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating customer:', error);
        return res.status(500).json({ error: 'Failed to update customer' });
      }
      
      customer = data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          phone: phone || null,
          role: 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating customer:', error);
        return res.status(500).json({ error: 'Failed to create customer' });
      }
      
      customer = data;
    }
    
    return res.status(existingUser && existingUser.length > 0 ? 200 : 201).json({ customer });
  } catch (err) {
    console.error('Error in customer creation/update:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;