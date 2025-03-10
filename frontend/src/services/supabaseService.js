import supabase from './supabaseClient';

// Auth methods
export const auth = {
  // Register a new user
  register: async (userData) => {
    const { email, password, name, role, businessName, businessCategory, phone, address } = userData;
    
    // Create metadata
    const metadata = {
      name,
      role: role || 'client',
      phone,
      businessName,
      businessCategory
    };
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Additional profile data
    if (data?.user?.id) {
      if (role === 'business' && businessName) {
        const { error: profileError } = await supabase
          .from('users')
          .update({
            business_name: businessName,
            business_category: businessCategory
          })
          .eq('id', data.user.id);
          
        if (profileError) {
          console.error('Error updating business profile:', profileError);
        }
      }
      
      if (address) {
        const { error: addressError } = await supabase
          .from('users')
          .update({
            street: address.street,
            city: address.city,
            state: address.state,
            zip_code: address.zipCode,
            country: address.country
          })
          .eq('id', data.user.id);
          
        if (addressError) {
          console.error('Error updating address:', addressError);
        }
      }
    }
    
    return { 
      user: {
        id: data.user.id,
        name,
        email: data.user.email,
        role: role || 'client',
      },
      session: data.session
    };
  },
  
  // Sign in with email and password
  login: async (credentials) => {
    const { email, password } = credentials;
    
    // Validate required fields
    if (!email) {
      console.error('Login error: Missing email');
      throw new Error('Email is required');
    }
    
    if (!password) {
      console.error('Login error: Missing password');
      throw new Error('Password is required');
    }
    
    console.log('Attempting to sign in with email:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw new Error(error.message);
      }
      
      if (!data || !data.user) {
        console.error('No user data returned from auth');
        throw new Error('Authentication failed');
      }
      
      // Get user profile data
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }
      
      return {
        user: {
          id: data.user.id,
          name: userData?.name || data.user.user_metadata?.name,
          email: data.user.email,
          role: userData?.role || data.user.user_metadata?.role || 'client',
          isVerified: data.user.email_confirmed_at ? true : false,
          avatar: userData?.avatar_url,
          businessName: userData?.business_name
        },
        session: data.session
      };
    } catch (err) {
      console.error('Login error in supabaseService:', err);
      throw err;
    }
  },
  
  // Sign out
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  },
  
  // Get the current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.session;
  },
  
  // Reset password
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  },
  
  // Update password
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  }
};

// User methods
export const users = {
  // Get current user profile
  getCurrentUser: async () => {
    // First get the auth user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Then get the profile data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      id: user.id,
      name: data.name || user.user_metadata?.name,
      email: user.email,
      role: data.role || user.user_metadata?.role || 'client',
      phone: data.phone,
      avatar: data.avatar_url,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zip_code,
        country: data.country
      },
      businessName: data.business_name,
      businessCategory: data.business_category,
      businessDescription: data.business_description,
      website: data.website
    };
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Format data for Supabase
    const updateData = {
      name: profileData.name,
      phone: profileData.phone,
      street: profileData.address?.street,
      city: profileData.address?.city,
      state: profileData.address?.state,
      zip_code: profileData.address?.zipCode,
      country: profileData.address?.country
    };
    
    // Add business fields if needed
    if (profileData.businessName) {
      updateData.business_name = profileData.businessName;
      updateData.business_category = profileData.businessCategory;
      updateData.business_description = profileData.businessDescription;
      updateData.website = profileData.website;
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    // Format the response to match the existing API format
    return {
      user: {
        id: user.id,
        name: data.name,
        email: user.email,
        role: data.role,
        phone: data.phone,
        avatar: data.avatar_url,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zip_code,
          country: data.country
        },
        businessName: data.business_name,
        businessCategory: data.business_category,
        businessDescription: data.business_description,
        website: data.website
      }
    };
  },
  
  // Upload avatar
  uploadAvatar: async (file) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);
      
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
      
    // Update user profile with avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
      
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    return publicUrl;
  }
};

// Pet methods
export const pets = {
  // Get all pets for current user
  getPets: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', user.id);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Get a specific pet
  getPet: async (id) => {
    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        pet_emergency_contacts(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Create a new pet
  createPet: async (petData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Format data for Supabase
    const newPet = {
      owner_id: user.id,
      name: petData.name,
      type: petData.type,
      breed: petData.breed,
      age: petData.age,
      gender: petData.gender,
      special_requirements: petData.specialRequirements
    };
    
    const { data, error } = await supabase
      .from('pets')
      .insert(newPet)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    // If emergency contacts were provided, add them
    if (petData.emergencyContacts && petData.emergencyContacts.length > 0) {
      const emergencyContacts = petData.emergencyContacts.map(contact => ({
        pet_id: data.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        relationship: contact.relationship
      }));
      
      const { error: contactsError } = await supabase
        .from('pet_emergency_contacts')
        .insert(emergencyContacts);
        
      if (contactsError) {
        console.error('Error adding emergency contacts:', contactsError);
      }
    }
    
    return data;
  },
  
  // Update an existing pet
  updatePet: async (id, petData) => {
    // Format data for Supabase
    const updateData = {
      name: petData.name,
      type: petData.type,
      breed: petData.breed,
      age: petData.age,
      gender: petData.gender,
      special_requirements: petData.specialRequirements
    };
    
    const { data, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    // If emergency contacts were provided, update them
    if (petData.emergencyContacts && petData.emergencyContacts.length > 0) {
      // First delete existing contacts
      const { error: deleteError } = await supabase
        .from('pet_emergency_contacts')
        .delete()
        .eq('pet_id', id);
        
      if (deleteError) {
        console.error('Error deleting emergency contacts:', deleteError);
      }
      
      // Then add new ones
      const emergencyContacts = petData.emergencyContacts.map(contact => ({
        pet_id: id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        relationship: contact.relationship
      }));
      
      const { error: contactsError } = await supabase
        .from('pet_emergency_contacts')
        .insert(emergencyContacts);
        
      if (contactsError) {
        console.error('Error adding emergency contacts:', contactsError);
      }
    }
    
    return data;
  },
  
  // Delete a pet
  deletePet: async (id) => {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  },
  
  // Upload pet photo
  uploadPetPhoto: async (id, file) => {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}/${Date.now()}.${fileExt}`;
    const filePath = `pets/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(filePath, file);
      
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(filePath);
      
    // Update pet with photo URL
    const { error: updateError } = await supabase
      .from('pets')
      .update({ photo_url: publicUrl })
      .eq('id', id);
      
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    return publicUrl;
  }
};

// Service methods
export const services = {
  // Get all services with optional filters
  getServices: async (params) => {
    let query = supabase
      .from('services')
      .select('*');
      
    // Apply filters if provided
    if (params) {
      if (params.providerId) {
        query = query.eq('provider_id', params.providerId);
      }
      
      if (params.category) {
        query = query.eq('category', params.category);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Get a specific service with all related data
  getService: async (id) => {
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
      
    if (serviceError) {
      throw new Error(serviceError.message);
    }
    
    // Get availability
    const { data: availability, error: availabilityError } = await supabase
      .from('service_availability')
      .select('*')
      .eq('service_id', id);
      
    if (availabilityError) {
      console.error('Error fetching availability:', availabilityError);
    }
    
    // Get custom form schema if exists
    const { data: customForm, error: formError } = await supabase
      .from('service_custom_forms')
      .select('*')
      .eq('service_id', id)
      .maybeSingle();
      
    if (formError && formError.code !== 'PGRST116') {
      console.error('Error fetching custom form:', formError);
    }
    
    return {
      ...service,
      availability: availability || [],
      customForm: customForm ? customForm.form_schema : null
    };
  },
  
  // Create a new service
  createService: async (serviceData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Format data for Supabase
    const newService = {
      provider_id: user.id,
      title: serviceData.title,
      description: serviceData.description,
      category: serviceData.category,
      price_amount: serviceData.price.amount,
      price_currency: serviceData.price.currency || 'USD',
      duration: serviceData.duration,
      location_options: serviceData.locationOptions,
      capacity: serviceData.capacity || 1,
      buffer_time: serviceData.bufferTime || 0
    };
    
    const { data, error } = await supabase
      .from('services')
      .insert(newService)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    // Add availability if provided
    if (serviceData.availability && serviceData.availability.length > 0) {
      const availability = serviceData.availability.map(slot => ({
        service_id: data.id,
        day_of_week: slot.dayOfWeek,
        specific_date: slot.specificDate,
        start_time: slot.startTime,
        end_time: slot.endTime,
        is_available: slot.isAvailable !== false
      }));
      
      const { error: availabilityError } = await supabase
        .from('service_availability')
        .insert(availability);
        
      if (availabilityError) {
        console.error('Error adding availability:', availabilityError);
      }
    }
    
    // Add custom form if provided
    if (serviceData.customForm) {
      const { error: formError } = await supabase
        .from('service_custom_forms')
        .insert({
          service_id: data.id,
          form_schema: serviceData.customForm
        });
        
      if (formError) {
        console.error('Error adding custom form:', formError);
      }
    }
    
    return data;
  },
  
  // Update an existing service
  updateService: async (id, serviceData) => {
    // Format data for Supabase
    const updateData = {
      title: serviceData.title,
      description: serviceData.description,
      category: serviceData.category,
      price_amount: serviceData.price.amount,
      price_currency: serviceData.price.currency || 'USD',
      duration: serviceData.duration,
      location_options: serviceData.locationOptions,
      capacity: serviceData.capacity || 1,
      buffer_time: serviceData.bufferTime || 0
    };
    
    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    // Update availability if provided
    if (serviceData.availability && serviceData.availability.length > 0) {
      // First delete existing availability
      const { error: deleteError } = await supabase
        .from('service_availability')
        .delete()
        .eq('service_id', id);
        
      if (deleteError) {
        console.error('Error deleting availability:', deleteError);
      }
      
      // Then add new availability
      const availability = serviceData.availability.map(slot => ({
        service_id: id,
        day_of_week: slot.dayOfWeek,
        specific_date: slot.specificDate,
        start_time: slot.startTime,
        end_time: slot.endTime,
        is_available: slot.isAvailable !== false
      }));
      
      const { error: availabilityError } = await supabase
        .from('service_availability')
        .insert(availability);
        
      if (availabilityError) {
        console.error('Error adding availability:', availabilityError);
      }
    }
    
    // Update custom form if provided
    if (serviceData.customForm) {
      // Check if form already exists
      const { data: existingForm, error: checkError } = await supabase
        .from('service_custom_forms')
        .select('id')
        .eq('service_id', id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking custom form:', checkError);
      }
      
      if (existingForm) {
        // Update existing form
        const { error: updateError } = await supabase
          .from('service_custom_forms')
          .update({ form_schema: serviceData.customForm })
          .eq('id', existingForm.id);
          
        if (updateError) {
          console.error('Error updating custom form:', updateError);
        }
      } else {
        // Insert new form
        const { error: insertError } = await supabase
          .from('service_custom_forms')
          .insert({
            service_id: id,
            form_schema: serviceData.customForm
          });
          
        if (insertError) {
          console.error('Error adding custom form:', insertError);
        }
      }
    }
    
    return data;
  },
  
  // Delete a service
  deleteService: async (id) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  }
};

// Booking methods
export const bookings = {
  // Get all bookings with filters
  getBookings: async (params) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        services(title, description, price_amount, price_currency),
        pets(name, type, breed)
      `);
      
    // Apply filters based on user role and params
    if (user.user_metadata?.role === 'client') {
      query = query.eq('client_id', user.id);
    } else if (user.user_metadata?.role === 'business') {
      query = query.eq('provider_id', user.id);
    }
    
    if (params) {
      if (params.status) {
        query = query.eq('status', params.status);
      }
      
      if (params.startDate && params.endDate) {
        query = query
          .gte('start_time', params.startDate)
          .lte('start_time', params.endDate);
      }
    }
    
    // Order by start time, newest first
    query = query.order('start_time', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Get a specific booking
  getBooking: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services(*),
        reviews(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Create a new booking
  createBooking: async (bookingData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Get service to verify provider and price
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('provider_id, price_amount, price_currency')
      .eq('id', bookingData.serviceId)
      .single();
      
    if (serviceError) {
      throw new Error('Service not found');
    }
    
    // Format booking data for Supabase
    const newBooking = {
      service_id: bookingData.serviceId,
      provider_id: bookingData.providerId || service.provider_id,
      client_id: user.id,
      pet_id: bookingData.petId,
      start_time: new Date(bookingData.startTime).toISOString(),
      end_time: new Date(bookingData.endTime).toISOString(),
      location: bookingData.location,
      total_price_amount: service.price_amount,
      total_price_currency: service.price_currency || 'USD',
      client_notes: bookingData.notes?.client || null,
      provider_notes: bookingData.notes?.provider || null,
      internal_notes: bookingData.notes?.internal || null,
      custom_form_data: bookingData.customFormData || null,
      status: 'pending'
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(newBooking)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Update an existing booking
  updateBooking: async (id, bookingData) => {
    // Format data for Supabase
    const updateData = {};
    
    if (bookingData.startTime) {
      updateData.start_time = new Date(bookingData.startTime).toISOString();
    }
    
    if (bookingData.endTime) {
      updateData.end_time = new Date(bookingData.endTime).toISOString();
    }
    
    if (bookingData.status) {
      updateData.status = bookingData.status;
    }
    
    if (bookingData.notes) {
      if (bookingData.notes.client !== undefined) {
        updateData.client_notes = bookingData.notes.client;
      }
      
      if (bookingData.notes.provider !== undefined) {
        updateData.provider_notes = bookingData.notes.provider;
      }
      
      if (bookingData.notes.internal !== undefined) {
        updateData.internal_notes = bookingData.notes.internal;
      }
    }
    
    if (bookingData.assignedStaff) {
      updateData.assigned_staff_id = bookingData.assignedStaff;
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Cancel a booking
  cancelBooking: async (id, reason) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Get booking to determine who is cancelling
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('client_id, provider_id')
      .eq('id', id)
      .single();
      
    if (bookingError) {
      throw new Error('Booking not found');
    }
    
    // Determine who is cancelling
    let cancellationBy;
    if (booking.client_id === user.id) {
      cancellationBy = 'client';
    } else if (booking.provider_id === user.id) {
      cancellationBy = 'provider';
    } else if (user.user_metadata?.role === 'admin') {
      cancellationBy = 'admin';
    } else {
      throw new Error('Not authorized to cancel this booking');
    }
    
    // Update booking
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || 'No reason provided',
        cancellation_time: new Date().toISOString(),
        cancellation_by: cancellationBy
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Mark a booking as completed
  completeBooking: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },
  
  // Add a review to a booking
  addReview: async (bookingId, reviewData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    // Get booking to verify client and provider
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('client_id, provider_id, status')
      .eq('id', bookingId)
      .single();
      
    if (bookingError) {
      throw new Error('Booking not found');
    }
    
    // Verify client is adding the review
    if (booking.client_id !== user.id) {
      throw new Error('Not authorized to review this booking');
    }
    
    // Verify booking is completed
    if (booking.status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }
    
    // Create the review
    const newReview = {
      booking_id: bookingId,
      client_id: user.id,
      provider_id: booking.provider_id,
      rating: reviewData.rating,
      comment: reviewData.comment || ''
    };
    
    const { data, error } = await supabase
      .from('reviews')
      .insert(newReview)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }
};

// Payment methods
export const payments = {
  // Create a payment intent
  createPaymentIntent: async (bookingId) => {
    // For now, we'll just make an API call to the existing endpoint
    // This would ideally be replaced with a direct Supabase Edge Function call
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ bookingId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment intent');
    }
    
    return data;
  }
};


// The primary export is used for compatibility with the existing API service
export default {
  auth,
  users,
  pets,
  services,
  bookings,
  payments
};