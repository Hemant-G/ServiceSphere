const express = require('express');
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getPredefinedServices,
  getMyServices
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const { PREDEFINED_SERVICES } = require('../utils/serviceConstants.js');

const router = express.Router();

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

const validateService = [
  body('title')
    .isIn(PREDEFINED_SERVICES)
    .withMessage('Invalid service title'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  handleValidationErrors
];

// Public routes
router.get('/', getAllServices);
router.get('/predefined', getPredefinedServices);

// Protected provider routes
router.get('/my-services', protect, authorize('provider'), getMyServices);

// Public routes
router.get('/:id', getServiceById);

// Protected provider routes
router.post(
  '/',
  protect,
  authorize('provider'),
  validateService,
  createService
);
router.put(
  '/:id',
  protect,
  authorize('provider'),
  validateService,
  updateService
);
router.delete('/:id', protect, authorize('provider'), deleteService);

module.exports = router;