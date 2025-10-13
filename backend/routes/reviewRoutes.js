const express = require('express');
const {
  createReview,
  getProviderReviews,
  getServiceReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewStats
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

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

// Review validation
const validateReview = [
  body('bookingId')
    .isMongoId()
    .withMessage('Please provide a valid booking ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot be more than 500 characters'),
  
  body('detailedRatings.quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5'),
  
  body('detailedRatings.punctuality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Punctuality rating must be between 1 and 5'),
  
  body('detailedRatings.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  
  body('detailedRatings.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be between 1 and 5'),
  
  handleValidationErrors
];

// Public routes
router.get('/provider/:providerId', getProviderReviews);
router.get('/service/:serviceId', getServiceReviews);
router.get('/stats/:providerId', getReviewStats);

// Protected routes
router.use(protect);

// Customer routes
router.post('/', authorize('customer'), validateReview, createReview);
router.get('/my-reviews', authorize('customer'), getMyReviews);
router.put('/:id', authorize('customer'), validateReview, updateReview);
router.delete('/:id', authorize('customer'), deleteReview);

module.exports = router;
