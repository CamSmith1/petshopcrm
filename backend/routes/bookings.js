const express = require('express');
const router = express.Router();
const { authenticate, isClient, isBusiness } = require('../middlewares/auth');

// Import the booking controller
const bookingController = require('../controllers/bookingController');

// Get all bookings (authenticated users)
router.get('/', authenticate, bookingController.getBookings);

// Get booking by ID (authenticated users)
router.get('/:id', authenticate, bookingController.getBooking);

// Create new booking (client only)
router.post('/', authenticate, isClient, bookingController.createBooking);

// Update booking (authenticated users)
router.put('/:id', authenticate, bookingController.updateBooking);

// Cancel booking
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

// Complete booking (business only)
router.put('/:id/complete', authenticate, isBusiness, bookingController.completeBooking);

// Add review to booking (client only)
router.post('/:id/review', authenticate, isClient, bookingController.addReview);

module.exports = router;