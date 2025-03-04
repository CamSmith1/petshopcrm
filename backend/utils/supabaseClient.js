const supabase = require('../config/supabase');

/**
 * User operations with Supabase
 */
exports.auth = {
  // Register a new user
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return true;
  },
  
  // Reset password
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`,
    });
    
    if (error) throw new Error(error.message);
    return true;
  },
  
  // Update user
  updateUser: async (attributes) => {
    const { data, error } = await supabase.auth.updateUser(attributes);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw new Error(error.message);
    return data.session;
  },
  
  // Verify JWT token
  verifyToken: async (token) => {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) throw new Error(error.message);
    return data.user;
  }
};

/**
 * User profile operations
 */
exports.users = {
  // Get user profile by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get user with business hours
  getBusinessWithHours: async (id) => {
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'business')
      .single();
    
    if (userError) throw new Error(userError.message);
    if (!user) throw new Error('Business not found');
    
    // Get business hours
    const { data: hours, error: hoursError } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', id);
    
    if (hoursError) throw new Error(hoursError.message);
    
    // Get staff members
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', id);
    
    if (staffError) throw new Error(staffError.message);
    
    // Format business hours
    const businessHours = {};
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    daysOfWeek.forEach(day => {
      businessHours[day] = hours
        .filter(h => h.day_of_week === day)
        .map(h => ({ start: h.start_time, end: h.end_time }));
    });
    
    return {
      ...user,
      businessHours,
      staff
    };
  },
  
  // Update user profile
  update: async (id, userData) => {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update business hours
  updateBusinessHours: async (businessId, businessHours) => {
    // Start a transaction
    const { error: deleteError } = await supabase
      .from('business_hours')
      .delete()
      .eq('business_id', businessId);
    
    if (deleteError) throw new Error(deleteError.message);
    
    // Format hours for insertion
    const hoursToInsert = [];
    Object.entries(businessHours).forEach(([day, slots]) => {
      slots.forEach(slot => {
        hoursToInsert.push({
          business_id: businessId,
          day_of_week: day,
          start_time: slot.start,
          end_time: slot.end
        });
      });
    });
    
    if (hoursToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('business_hours')
        .insert(hoursToInsert);
      
      if (insertError) throw new Error(insertError.message);
    }
    
    return true;
  },
  
  // Generate API key for business
  generateApiKey: async (businessId, keyName) => {
    const { data, error } = await supabase.rpc('generate_api_key', {
      business_id: businessId,
      key_name: keyName
    });
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update widget settings
  updateWidgetSettings: async (businessId, settings) => {
    // Check if settings exist
    const { data: existing, error: checkError } = await supabase
      .from('widget_settings')
      .select('id')
      .eq('business_id', businessId)
      .maybeSingle();
    
    if (checkError) throw new Error(checkError.message);
    
    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('widget_settings')
        .update(settings)
        .eq('business_id', businessId)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('widget_settings')
        .insert({ ...settings, business_id: businessId })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    }
  }
};

/**
 * Pet operations
 */
exports.pets = {
  // Create a new pet
  create: async (petData) => {
    const { data, error } = await supabase
      .from('pets')
      .insert(petData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get pet by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        pet_emergency_contacts(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get pets by owner
  getByOwner: async (ownerId) => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update pet
  update: async (id, petData) => {
    const { data, error } = await supabase
      .from('pets')
      .update(petData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Delete pet
  delete: async (id) => {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }
};

/**
 * Service operations
 */
exports.services = {
  // Create a new service
  create: async (serviceData) => {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get service by ID with availability
  getById: async (id) => {
    // Get service data
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (serviceError) throw new Error(serviceError.message);
    
    // Get availability
    const { data: availability, error: availabilityError } = await supabase
      .from('service_availability')
      .select('*')
      .eq('service_id', id);
    
    if (availabilityError) throw new Error(availabilityError.message);
    
    // Get custom form
    const { data: customForm, error: formError } = await supabase
      .from('service_custom_forms')
      .select('*')
      .eq('service_id', id)
      .maybeSingle();
    
    if (formError) throw new Error(formError.message);
    
    return {
      ...service,
      availability,
      customForm: customForm ? customForm.form_schema : null
    };
  },
  
  // Get services by provider
  getByProvider: async (providerId) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId);
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update service
  update: async (id, serviceData) => {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update service availability
  updateAvailability: async (serviceId, availabilityData) => {
    // Delete existing availability
    const { error: deleteError } = await supabase
      .from('service_availability')
      .delete()
      .eq('service_id', serviceId);
    
    if (deleteError) throw new Error(deleteError.message);
    
    // Format new availability for insertion
    const availabilityToInsert = availabilityData.map(a => ({
      ...a,
      service_id: serviceId
    }));
    
    if (availabilityToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('service_availability')
        .insert(availabilityToInsert);
      
      if (insertError) throw new Error(insertError.message);
    }
    
    return true;
  },
  
  // Update service custom form
  updateCustomForm: async (serviceId, formSchema) => {
    // Check if form already exists
    const { data: existing, error: checkError } = await supabase
      .from('service_custom_forms')
      .select('id')
      .eq('service_id', serviceId)
      .maybeSingle();
    
    if (checkError) throw new Error(checkError.message);
    
    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('service_custom_forms')
        .update({ form_schema: formSchema })
        .eq('id', existing.id);
      
      if (error) throw new Error(error.message);
    } else {
      // Insert new
      const { error } = await supabase
        .from('service_custom_forms')
        .insert({
          service_id: serviceId,
          form_schema: formSchema
        });
      
      if (error) throw new Error(error.message);
    }
    
    return true;
  },
  
  // Delete service
  delete: async (id) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
  }
};

/**
 * Booking operations
 */
exports.bookings = {
  // Create a new booking
  create: async (bookingData) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get booking by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services(*),
        reviews(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get bookings with filters
  getBookings: async (filters = {}) => {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        services(title, description, price_amount, price_currency),
        pets(name, type, breed)
      `);
    
    // Apply filters
    if (filters.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    
    if (filters.providerId) {
      query = query.eq('provider_id', filters.providerId);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.startDate && filters.endDate) {
      query = query
        .gte('start_time', filters.startDate)
        .lte('start_time', filters.endDate);
    }
    
    // Order by start time, newest first
    query = query.order('start_time', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Update booking
  update: async (id, bookingData) => {
    const { data, error } = await supabase
      .from('bookings')
      .update(bookingData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Add reminder
  addReminder: async (bookingId, reminderData) => {
    const { data, error } = await supabase
      .from('booking_reminders')
      .insert({
        booking_id: bookingId,
        ...reminderData
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Add review
  addReview: async (reviewData) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  // Get reviews for a provider
  getReviewsForProvider: async (providerId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        bookings(
          id,
          service_id,
          start_time,
          services(title)
        )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  }
};

// Storage operations for file uploads
exports.storage = {
  // Upload a file
  uploadFile: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600'
      });
    
    if (error) throw new Error(error.message);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrlData.publicUrl;
  },
  
  // Delete a file
  deleteFile: async (bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw new Error(error.message);
    return true;
  }
};