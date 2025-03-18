const supabaseClient = require('../utils/supabaseClient');

// Get all venues with optional filtering
exports.getVenues = async (req, res, next) => {
  try {
    const filters = {};
    
    // Apply filters from query parameters
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    if (req.query.capacity) {
      filters.minCapacity = parseInt(req.query.capacity);
    }
    
    if (req.query.location) {
      filters.location = req.query.location;
    }
    
    if (req.query.amenities) {
      filters.amenities = req.query.amenities.split(',');
    }
    
    if (req.query.indoor_outdoor) {
      filters.indoorOutdoor = req.query.indoor_outdoor;
    }
    
    // Include inactive venues only for admin users
    if (req.user && ['admin', 'venue_manager'].includes(req.user.role)) {
      if (req.query.includeInactive === 'true') {
        filters.includeInactive = true;
      }
    } else {
      filters.includeInactive = false;
    }
    
    // Fetch venues with applied filters
    const venues = await supabaseClient.venues.getVenues(filters);
    
    res.status(200).json({ venues });
  } catch (error) {
    next(error);
  }
};

// Get venue by ID with detailed information
exports.getVenue = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    
    // Get venue details
    const venue = await supabaseClient.venues.getById(venueId);
    
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    // If venue is inactive and user is not admin, don't show it
    if (!venue.is_active && !(req.user && ['admin', 'venue_manager'].includes(req.user.role))) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    // Get venue layouts if available
    const layouts = await supabaseClient.venueLayouts.getByVenueId(venueId);
    
    // Get available equipment for the venue
    const equipment = await supabaseClient.venueEquipment.getByVenueId(venueId);
    
    // Get availability settings
    const availability = await supabaseClient.venueAvailability.getByVenueId(venueId);
    
    // Get upcoming events for the venue that are public
    const upcomingEvents = await supabaseClient.eventsCalendar.getUpcomingByVenueId(venueId);
    
    // Get venue forms required for booking
    const forms = await supabaseClient.venueForms.getByVenueId(venueId);
    
    res.status(200).json({
      venue,
      layouts,
      equipment,
      availability,
      upcomingEvents,
      forms
    });
  } catch (error) {
    next(error);
  }
};

// Create new venue (admin only)
exports.createVenue = async (req, res, next) => {
  try {
    // Only admin or venue manager can create venues
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to create venues' });
    }
    
    const {
      name,
      description,
      category,
      location,
      address,
      capacity,
      areaSize,
      indoorOutdoor,
      amenities,
      accessibilityFeatures,
      images,
      floorPlans,
      mapCoordinates,
      priceCommercial,
      priceCommunity,
      priceStandard,
      priceCurrency,
      bondRequired,
      bondAmount,
      minBookingTime,
      maxBookingTime,
      bookingIncrement,
      bufferTime,
      advanceBookingMin,
      advanceBookingMax,
      autoConfirmThreshold,
      minNoticeForCancellation,
      isActive
    } = req.body;
    
    // Validate required fields
    if (!name || !location || !address || !capacity) {
      return res.status(400).json({
        error: 'Missing required fields: name, location, address, and capacity are required'
      });
    }
    
    // Prepare venue data
    const venueData = {
      name,
      description,
      category,
      location,
      address,
      capacity,
      area_size: areaSize,
      indoor_outdoor: indoorOutdoor,
      amenities: amenities || [],
      accessibility_features: accessibilityFeatures || [],
      images: images || [],
      floor_plans: floorPlans || [],
      map_coordinates: mapCoordinates || null,
      price_commercial: priceCommercial,
      price_community: priceCommunity,
      price_standard: priceStandard,
      price_currency: priceCurrency || 'NZD',
      bond_required: bondRequired || false,
      bond_amount: bondAmount || 0,
      min_booking_time: minBookingTime,
      max_booking_time: maxBookingTime,
      booking_increment: bookingIncrement || 30,
      buffer_time: bufferTime || 0,
      advance_booking_min: advanceBookingMin,
      advance_booking_max: advanceBookingMax,
      auto_confirm_threshold: autoConfirmThreshold,
      min_notice_for_cancellation: minNoticeForCancellation,
      is_active: isActive !== undefined ? isActive : true,
      created_at: new Date().toISOString(),
    };
    
    // Create venue in Supabase
    const venue = await supabaseClient.venues.create(venueData);
    
    res.status(201).json({
      message: 'Venue created successfully',
      venue
    });
  } catch (error) {
    next(error);
  }
};

// Update venue (admin only)
exports.updateVenue = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    
    // Only admin or venue manager can update venues
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to update venues' });
    }
    
    // Check if venue exists
    const existingVenue = await supabaseClient.venues.getById(venueId);
    if (!existingVenue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    const {
      name,
      description,
      category,
      location,
      address,
      capacity,
      areaSize,
      indoorOutdoor,
      amenities,
      accessibilityFeatures,
      images,
      floorPlans,
      mapCoordinates,
      priceCommercial,
      priceCommunity,
      priceStandard,
      priceCurrency,
      bondRequired,
      bondAmount,
      minBookingTime,
      maxBookingTime,
      bookingIncrement,
      bufferTime,
      advanceBookingMin,
      advanceBookingMax,
      autoConfirmThreshold,
      minNoticeForCancellation,
      isActive
    } = req.body;
    
    // Prepare update data - only include fields that were provided
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (location !== undefined) updateData.location = location;
    if (address !== undefined) updateData.address = address;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (areaSize !== undefined) updateData.area_size = areaSize;
    if (indoorOutdoor !== undefined) updateData.indoor_outdoor = indoorOutdoor;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (accessibilityFeatures !== undefined) updateData.accessibility_features = accessibilityFeatures;
    if (images !== undefined) updateData.images = images;
    if (floorPlans !== undefined) updateData.floor_plans = floorPlans;
    if (mapCoordinates !== undefined) updateData.map_coordinates = mapCoordinates;
    if (priceCommercial !== undefined) updateData.price_commercial = priceCommercial;
    if (priceCommunity !== undefined) updateData.price_community = priceCommunity;
    if (priceStandard !== undefined) updateData.price_standard = priceStandard;
    if (priceCurrency !== undefined) updateData.price_currency = priceCurrency;
    if (bondRequired !== undefined) updateData.bond_required = bondRequired;
    if (bondAmount !== undefined) updateData.bond_amount = bondAmount;
    if (minBookingTime !== undefined) updateData.min_booking_time = minBookingTime;
    if (maxBookingTime !== undefined) updateData.max_booking_time = maxBookingTime;
    if (bookingIncrement !== undefined) updateData.booking_increment = bookingIncrement;
    if (bufferTime !== undefined) updateData.buffer_time = bufferTime;
    if (advanceBookingMin !== undefined) updateData.advance_booking_min = advanceBookingMin;
    if (advanceBookingMax !== undefined) updateData.advance_booking_max = advanceBookingMax;
    if (autoConfirmThreshold !== undefined) updateData.auto_confirm_threshold = autoConfirmThreshold;
    if (minNoticeForCancellation !== undefined) updateData.min_notice_for_cancellation = minNoticeForCancellation;
    if (isActive !== undefined) updateData.is_active = isActive;
    
    // Update venue in Supabase
    const updatedVenue = await supabaseClient.venues.update(venueId, updateData);
    
    res.status(200).json({
      message: 'Venue updated successfully',
      venue: updatedVenue
    });
  } catch (error) {
    next(error);
  }
};

// Add layout to venue
exports.addVenueLayout = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    
    // Only admin or venue manager can add layouts
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to add venue layouts' });
    }
    
    // Check if venue exists
    const venue = await supabaseClient.venues.getById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    const {
      name,
      description,
      capacity,
      layoutImage,
      layoutDetails,
      isDefault
    } = req.body;
    
    // Validate required fields
    if (!name || !capacity) {
      return res.status(400).json({
        error: 'Missing required fields: name and capacity are required'
      });
    }
    
    // Prepare layout data
    const layoutData = {
      venue_id: venueId,
      name,
      description,
      capacity,
      layout_image: layoutImage,
      layout_details: layoutDetails || {},
      is_default: isDefault || false
    };
    
    // If this is set as default, unset any existing default
    if (isDefault) {
      await supabaseClient.venueLayouts.unsetDefaultForVenue(venueId);
    }
    
    // Create layout in Supabase
    const layout = await supabaseClient.venueLayouts.create(layoutData);
    
    res.status(201).json({
      message: 'Venue layout added successfully',
      layout
    });
  } catch (error) {
    next(error);
  }
};

// Add equipment to venue
exports.addEquipmentToVenue = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    
    // Only admin or venue manager can add equipment
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to add equipment to venues' });
    }
    
    // Check if venue exists
    const venue = await supabaseClient.venues.getById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    const {
      equipmentId,
      quantityAvailable,
      notes
    } = req.body;
    
    // Validate required fields
    if (!equipmentId) {
      return res.status(400).json({
        error: 'Missing required field: equipmentId is required'
      });
    }
    
    // Check if equipment exists
    const equipment = await supabaseClient.equipment.getById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Check if equipment is already associated with venue
    const existingAssociation = await supabaseClient.venueEquipment.getByVenueAndEquipment(venueId, equipmentId);
    if (existingAssociation) {
      return res.status(409).json({ error: 'Equipment is already associated with this venue' });
    }
    
    // Prepare association data
    const associationData = {
      venue_id: venueId,
      equipment_id: equipmentId,
      quantity_available: quantityAvailable || 1,
      notes: notes
    };
    
    // Create association in Supabase
    const association = await supabaseClient.venueEquipment.create(associationData);
    
    res.status(201).json({
      message: 'Equipment added to venue successfully',
      equipment: {
        ...equipment,
        quantity_available: associationData.quantity_available,
        notes: associationData.notes
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update venue availability settings
exports.updateVenueAvailability = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    
    // Only admin or venue manager can update availability
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to update venue availability' });
    }
    
    // Check if venue exists
    const venue = await supabaseClient.venues.getById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    const {
      dayOfWeek,
      specificDate,
      startTime,
      endTime,
      isAvailable,
      reason
    } = req.body;
    
    // Validate required fields - need either day of week or specific date
    if (!dayOfWeek && !specificDate) {
      return res.status(400).json({
        error: 'Missing required fields: either dayOfWeek or specificDate is required'
      });
    }
    
    if (!startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: startTime and endTime are required'
      });
    }
    
    // Prepare availability data
    const availabilityData = {
      venue_id: venueId,
      day_of_week: dayOfWeek,
      specific_date: specificDate,
      start_time: startTime,
      end_time: endTime,
      is_available: isAvailable !== undefined ? isAvailable : true,
      reason: reason,
      created_at: new Date().toISOString()
    };
    
    // Create availability in Supabase
    const availability = await supabaseClient.venueAvailability.create(availabilityData);
    
    res.status(201).json({
      message: 'Venue availability updated successfully',
      availability
    });
  } catch (error) {
    next(error);
  }
};

// Check venue availability for a specific time period
exports.checkVenueAvailability = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    const { startTime, endTime } = req.query;
    
    // Validate required fields
    if (!startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: startTime and endTime are required'
      });
    }
    
    // Check if venue exists
    const venue = await supabaseClient.venues.getById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    // Check if venue is available for the requested time
    const isAvailable = await supabaseClient.venues.checkAvailability(
      venueId,
      new Date(startTime).toISOString(),
      new Date(endTime).toISOString()
    );
    
    // Get any conflicting bookings
    const conflicts = await supabaseClient.venues.getConflictingBookings(
      venueId,
      new Date(startTime).toISOString(),
      new Date(endTime).toISOString()
    );
    
    // Get any venue holds
    const holds = await supabaseClient.venueHolds.getByVenueAndTimeRange(
      venueId,
      new Date(startTime).toISOString(),
      new Date(endTime).toISOString()
    );
    
    res.status(200).json({
      isAvailable,
      conflicts: conflicts.length > 0 ? { count: conflicts.length } : null,
      holds: holds.length > 0 ? 
        holds.map(h => ({
          holdType: h.hold_type,
          startTime: h.start_time,
          endTime: h.end_time,
          reason: h.hold_reason
        })) : 
        []
    });
  } catch (error) {
    next(error);
  }
};

// Add custom form to venue
exports.addVenueForm = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    
    // Only admin or venue manager can add forms
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to add forms to venues' });
    }
    
    // Check if venue exists
    const venue = await supabaseClient.venues.getById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    const {
      formName,
      formDescription,
      formSchema,
      isRequired,
      appliesTo
    } = req.body;
    
    // Validate required fields
    if (!formName || !formSchema) {
      return res.status(400).json({
        error: 'Missing required fields: formName and formSchema are required'
      });
    }
    
    // Prepare form data
    const formData = {
      venue_id: venueId,
      form_name: formName,
      form_description: formDescription,
      form_schema: formSchema,
      is_required: isRequired !== undefined ? isRequired : true,
      applies_to: appliesTo || null
    };
    
    // Create form in Supabase
    const form = await supabaseClient.venueForms.create(formData);
    
    res.status(201).json({
      message: 'Venue form added successfully',
      form
    });
  } catch (error) {
    next(error);
  }
};

// Get venue calendar (for admin dashboard)
exports.getVenueCalendar = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    const { startDate, endDate } = req.query;
    
    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required fields: startDate and endDate are required'
      });
    }
    
    // Check if venue exists
    const venue = await supabaseClient.venues.getById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    // Get confirmed bookings for the specified time range
    const bookings = await supabaseClient.bookings.getByVenueAndDateRange(
      venueId,
      new Date(startDate).toISOString(),
      new Date(endDate).toISOString()
    );
    
    // Get venue holds for the specified time range
    const holds = await supabaseClient.venueHolds.getByVenueAndTimeRange(
      venueId,
      new Date(startDate).toISOString(),
      new Date(endDate).toISOString()
    );
    
    // Format bookings and holds for calendar display
    const calendarEvents = [
      ...bookings.map(booking => ({
        id: booking.id,
        title: booking.event_name || 'Booking',
        start: booking.start_time,
        end: booking.end_time,
        type: 'booking',
        status: booking.status,
        customer: booking.customer_name,
        customerId: booking.customer_id,
        attendance: booking.expected_attendance,
        eventType: booking.event_type
      })),
      ...holds.map(hold => ({
        id: hold.id,
        title: `${hold.hold_type}: ${hold.hold_reason || 'No reason provided'}`,
        start: hold.start_time,
        end: hold.end_time,
        type: 'hold',
        holdType: hold.hold_type,
        heldBy: hold.held_by_name
      }))
    ];
    
    res.status(200).json({
      venue: {
        id: venue.id,
        name: venue.name
      },
      calendarEvents
    });
  } catch (error) {
    next(error);
  }
};

// Get equipment list (admin function)
exports.getAllEquipment = async (req, res, next) => {
  try {
    // Only admin or venue manager can see all equipment
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to view all equipment' });
    }
    
    // Get all equipment
    const equipment = await supabaseClient.equipment.getAll();
    
    res.status(200).json({ equipment });
  } catch (error) {
    next(error);
  }
};

// Create new equipment item
exports.createEquipment = async (req, res, next) => {
  try {
    // Only admin or venue manager can create equipment
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to create equipment' });
    }
    
    const {
      name,
      description,
      category,
      dailyFee,
      priceCurrency,
      quantityAvailable,
      setupRequired,
      setupInstructions,
      isActive
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Missing required field: name is required'
      });
    }
    
    // Prepare equipment data
    const equipmentData = {
      name,
      description,
      category,
      daily_fee: dailyFee || 0,
      price_currency: priceCurrency || 'NZD',
      quantity_available: quantityAvailable || 1,
      setup_required: setupRequired || false,
      setup_instructions: setupInstructions,
      is_active: isActive !== undefined ? isActive : true,
      created_at: new Date().toISOString()
    };
    
    // Create equipment in Supabase
    const equipment = await supabaseClient.equipment.create(equipmentData);
    
    res.status(201).json({
      message: 'Equipment created successfully',
      equipment
    });
  } catch (error) {
    next(error);
  }
};

// Add document type (for booking requirements)
exports.addDocumentType = async (req, res, next) => {
  try {
    // Only admin or venue manager can add document types
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to add document types' });
    }
    
    const {
      name,
      description,
      venueCategories,
      eventTypes,
      isMandatory
    } = req.body;
    
    // Validate required field
    if (!name) {
      return res.status(400).json({
        error: 'Missing required field: name is required'
      });
    }
    
    // Prepare document type data
    const documentTypeData = {
      name,
      description,
      venue_categories: venueCategories || [],
      event_types: eventTypes || [],
      is_mandatory: isMandatory || false
    };
    
    // Create document type in Supabase
    const documentType = await supabaseClient.documentTypes.create(documentTypeData);
    
    res.status(201).json({
      message: 'Document type added successfully',
      documentType
    });
  } catch (error) {
    next(error);
  }
};

// Get booking statistics for venue
exports.getVenueStatistics = async (req, res, next) => {
  try {
    const venueId = req.params.id;
    
    // Only admin or venue manager can view statistics
    if (!['admin', 'venue_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to view venue statistics' });
    }
    
    // Check if venue exists
    const venue = await supabaseClient.venues.getById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    const { startDate, endDate, groupBy } = req.query;
    
    // Default to last 30 days if not specified
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get booking statistics
    const statistics = await supabaseClient.bookings.getVenueStatistics(
      venueId,
      start.toISOString(),
      end.toISOString(),
      groupBy || 'month'
    );
    
    // Get total attendance
    const totalAttendance = await supabaseClient.bookings.getVenueTotalAttendance(
      venueId,
      start.toISOString(),
      end.toISOString()
    );
    
    // Get revenue by pricing tier
    const revenueByCombos = await supabaseClient.bookings.getVenueRevenueByCombos(
      venueId,
      start.toISOString(),
      end.toISOString()
    );
    
    // Get booking hours vs total available hours
    const utilization = await supabaseClient.bookings.getVenueUtilization(
      venueId,
      start.toISOString(),
      end.toISOString()
    );
    
    res.status(200).json({
      venue: {
        id: venue.id,
        name: venue.name
      },
      statistics,
      totalAttendance,
      revenueByCombos,
      utilization
    });
  } catch (error) {
    next(error);
  }
};