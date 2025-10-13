const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  getBookingStats
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Booking validation
const validateBooking = [
  body('serviceId')
    .isMongoId()
    .withMessage('Please provide a valid service ID'),
  
  body('providerId')
    .isMongoId()
    .withMessage('Please provide a valid provider ID'),
  
  body('scheduledDate')
    .isISO8601()
    .withMessage('Please provide a valid scheduled date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  
  body('contactPhone')
    .notEmpty()
    .withMessage('Contact phone is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('customerAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('customerAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  
  body('customerAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  
  body('customerAddress.zipCode')
    .notEmpty()
    .withMessage('ZIP code is required'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi', 'wallet'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// Status update validation
const validateStatusUpdate = [
  body('status')
    .isIn(['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
  
  handleValidationErrors
];

// All routes are protected
router.use(protect);

// Customer routes
router.post(
  '/', 
  authorize('customer'), 
  upload.array('customerImages', 5), // Handle up to 5 optional image uploads
  validateBooking, 
  createBooking
);

// Common routes
router.get('/my-bookings', getMyBookings);
router.get('/stats', getBookingStats);
router.get('/:id', getBookingById);
router.put('/:id/status', validateStatusUpdate, updateBookingStatus);

module.exports = router;
