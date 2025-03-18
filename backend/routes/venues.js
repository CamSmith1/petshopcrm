const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const authMiddleware = require('../middlewares/auth');

// Public routes - no authentication required
router.get('/', venueController.getVenues);
router.get('/:id', venueController.getVenue);
router.get('/:id/availability', venueController.getVenueAvailability);
router.get('/:id/layouts', venueController.getVenueLayouts);
router.get('/:id/equipment', venueController.getVenueEquipment);
router.get('/:id/images', venueController.getVenueImages);

// Protected routes - authentication required
router.use(authMiddleware.authenticate);

// Venue owner routes
router.post('/', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.createVenue);
router.put('/:id', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.updateVenue);
router.delete('/:id', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.deleteVenue);

// Venue layouts routes
router.get('/:id/layouts/:layoutId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.getVenueLayout);
router.post('/:id/layouts', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.createVenueLayout);
router.put('/:id/layouts/:layoutId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.updateVenueLayout);
router.delete('/:id/layouts/:layoutId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.deleteVenueLayout);

// Venue equipment routes
router.get('/:id/equipment/:equipmentId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.getVenueEquipmentItem);
router.post('/:id/equipment', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.createVenueEquipment);
router.put('/:id/equipment/:equipmentId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.updateVenueEquipment);
router.delete('/:id/equipment/:equipmentId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.deleteVenueEquipment);

// Venue bonds routes
router.get('/:id/bonds', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.getVenueBonds);
router.get('/:id/bonds/:bondId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.getVenueBond);
router.post('/:id/bonds', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.createVenueBond);
router.put('/:id/bonds/:bondId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.updateVenueBond);
router.delete('/:id/bonds/:bondId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.deleteVenueBond);

// Venue availability routes
router.post('/:id/availability', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.createVenueAvailability);
router.put('/:id/availability/:availabilityId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.updateVenueAvailability);
router.delete('/:id/availability/:availabilityId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.deleteVenueAvailability);

// Venue images routes
router.post('/:id/images', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.uploadVenueImage);
router.put('/:id/images/:imageId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.updateVenueImage);
router.delete('/:id/images/:imageId', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.deleteVenueImage);
router.put('/:id/images/:imageId/set-primary', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.setPrimaryVenueImage);

// Venue statistics and calendar
router.get('/:id/calendar', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.getVenueCalendar);
router.get('/:id/statistics', authMiddleware.requireRole(['admin', 'venue_owner']), venueController.getVenueStatistics);

module.exports = router;