const express = require('express');
const {
  getProviderProfile,
  updateProviderProfile,
  getProviderStats,
  getProviderServices,
  getProviderBookings
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Provider routes
router.get('/profile', authorize('provider'), getProviderProfile);
router.put('/profile', authorize('provider'), updateProviderProfile);
router.get('/stats', authorize('provider'), getProviderStats);
router.get('/services', authorize('provider'), getProviderServices);
router.get('/bookings', authorize('provider'), getProviderBookings);

module.exports = router;
