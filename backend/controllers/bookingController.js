const supabaseClient = require('../utils/supabaseClient');
const { sendEmail } = require('../utils/emailService');

// Get all bookings for user
exports.getBookings = async (req, res, next) => {
  try {
    const filters = {};
    
    // If client user, show only their bookings
    if (req.user.role === 'client') {
      filters.clientId = req.user.id;
    }
    
    // If business user, show only bookings for their services
    if (req.user.role === 'business') {
      filters.providerId = req.user.id;
    }
    
    // Add status filter if provided
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // Add date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      filters.startDate = req.query.startDate;
      filters.endDate = req.query.endDate;
    }

    // Fetch bookings from Supabase
    const bookings = await supabaseClient.bookings.getBookings(filters);
    
    res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
exports.getBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    
    // Get booking with related data
    const booking = await supabaseClient.bookings.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user is authorized to view this booking
    if (
      req.user.role !== 'admin' && 
      booking.client_id !== req.user.id &&
      booking.provider_id !== req.user.id
    ) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }
    
    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
};

// Create new booking
exports.createBooking = async (req, res, next) => {
  try {
    const { 
      serviceId, 
      providerId,
      petId,
      startTime, 
      endTime, 
      location,
      notes,
      customFormData
    } = req.body;
    
    // Validate required fields
    if (!serviceId || !startTime || !endTime || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: serviceId, startTime, endTime, and location are required' 
      });
    }
    
    // Fetch service to get pricing info
    const service = await supabaseClient.services.getById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Prepare booking data
    const bookingData = {
      service_id: serviceId,
      provider_id: providerId || service.provider_id,
      client_id: req.user.id,
      pet_id: petId,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      location,
      total_price_amount: service.price_amount,
      total_price_currency: service.price_currency || 'USD',
      client_notes: notes?.client || null,
      provider_notes: notes?.provider || null,
      internal_notes: notes?.internal || null,
      custom_form_data: customFormData || null,
      status: 'pending',
    };
    
    // Create booking in Supabase
    const booking = await supabaseClient.bookings.create(bookingData);
    
    // Notify service provider about new booking
    // Get provider details
    const provider = await supabaseClient.users.getById(booking.provider_id);
    
    if (provider && provider.email) {
      await sendEmail({
        to: provider.email,
        subject: 'New Booking Request',
        html: `You have a new booking request for ${service.title} on ${new Date(startTime).toLocaleString()}.
               Please log in to your dashboard to confirm or decline.`,
      });
    }
    
    res.status(201).json({ 
      message: 'Booking created successfully',
      booking 
    });
  } catch (error) {
    next(error);
  }
};

// Update booking
exports.updateBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { startTime, endTime, status, notes, assignedStaff } = req.body;
    
    // Get the booking
    const booking = await supabaseClient.bookings.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify that user has permission to update this booking
    if (
      req.user.role !== 'admin' &&
      booking.client_id !== req.user.id &&
      booking.provider_id !== req.user.id
    ) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }
    
    // Prepare update data
    const updateData = {};
    
    // Update fields if provided
    if (startTime) updateData.start_time = new Date(startTime).toISOString();
    if (endTime) updateData.end_time = new Date(endTime).toISOString();
    
    // Only provider or admin can update status
    if (status && (req.user.role === 'admin' || booking.provider_id === req.user.id)) {
      updateData.status = status;
      
      // Send notification to client on status change
      if (status === 'confirmed') {
        const client = await supabaseClient.users.getById(booking.client_id);
        const service = await supabaseClient.services.getById(booking.service_id);
        const pet = await supabaseClient.pets.getById(booking.pet_id);
        
        if (client && client.email) {
          await sendEmail({
            to: client.email,
            subject: 'Booking Confirmed',
            html: `Your booking has been confirmed for ${new Date(booking.start_time).toLocaleString()}.`,
          });
          
          // Send detailed confirmation email
          await sendEmail.sendBookingConfirmation({
            to: client.email,
            booking: booking,
            service: service,
            pet: pet
          });
        }
      }
    }
    
    // Update notes based on user role
    if (notes) {
      if (req.user.role === 'client') {
        updateData.client_notes = notes.client || booking.client_notes;
      } else if (req.user.role === 'business' || req.user.role === 'admin') {
        updateData.provider_notes = notes.provider || booking.provider_notes;
        updateData.internal_notes = notes.internal || booking.internal_notes;
      }
    }
    
    // Only provider or admin can update assigned staff
    if (assignedStaff && (req.user.role === 'admin' || booking.provider_id === req.user.id)) {
      updateData.assigned_staff_id = assignedStaff;
    }
    
    // Update booking in Supabase
    const updatedBooking = await supabaseClient.bookings.update(bookingId, updateData);
    
    res.status(200).json({ 
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { reason } = req.body;
    
    // Get the booking
    const booking = await supabaseClient.bookings.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify that user has permission to cancel this booking
    if (
      req.user.role !== 'admin' &&
      booking.client_id !== req.user.id &&
      booking.provider_id !== req.user.id
    ) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }
    
    // Prepare update data
    const updateData = {
      status: 'cancelled',
      cancellation_reason: reason || 'No reason provided',
      cancellation_time: new Date().toISOString(),
      cancellation_by: req.user.role === 'client' ? 'client' : 'provider'
    };
    
    // Update booking in Supabase
    const updatedBooking = await supabaseClient.bookings.update(bookingId, updateData);
    
    // Notify the other party about cancellation
    let recipientId;
    if (req.user.role === 'client') {
      recipientId = booking.provider_id;
    } else {
      recipientId = booking.client_id;
    }
    
    const recipient = await supabaseClient.users.getById(recipientId);
    if (recipient && recipient.email) {
      await sendEmail({
        to: recipient.email,
        subject: 'Booking Cancelled',
        html: `A booking for ${new Date(booking.start_time).toLocaleString()} 
               has been cancelled. Reason: ${updateData.cancellation_reason}`,
      });
    }
    
    res.status(200).json({ 
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Complete booking
exports.completeBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    
    // Get the booking
    const booking = await supabaseClient.bookings.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Only provider can mark as completed
    if (booking.provider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to complete this booking' });
    }
    
    // Update booking in Supabase
    const updatedBooking = await supabaseClient.bookings.update(bookingId, {
      status: 'completed'
    });
    
    // Notify client and request review
    const client = await supabaseClient.users.getById(booking.client_id);
    if (client && client.email) {
      await sendEmail({
        to: client.email,
        subject: 'Your Appointment is Completed',
        html: `Your booking has been marked as completed. 
               We hope you enjoyed the service! Please consider leaving a review.`,
      });
    }
    
    res.status(200).json({ 
      message: 'Booking marked as completed',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Add review to booking
exports.addReview = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { rating, comment } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Get the booking
    const booking = await supabaseClient.bookings.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Only client can add review
    if (booking.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to review this booking' });
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }
    
    // Prepare review data
    const reviewData = {
      booking_id: bookingId,
      client_id: req.user.id,
      provider_id: booking.provider_id,
      rating,
      comment: comment || '',
    };
    
    // Add review in Supabase
    const review = await supabaseClient.bookings.addReview(reviewData);
    
    res.status(201).json({ 
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};