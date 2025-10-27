const express = require('express');
const {
  createPortfolioItem,
  getProviderPortfolio,
  getMyPortfolio,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioCategories,
  signUpload,
} = require('../controllers/portfolioController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderPortfolio);
router.get('/categories', getPortfolioCategories);

// Private routes
router.route('/')
  .post(
    protect, 
    authorize('provider'), 
    upload.fields([{ name: 'images', maxCount: 5 }, { name: 'resume', maxCount: 1 }]), 
    createPortfolioItem
  );

// Signed upload helper for client -> Cloudinary direct uploads
router.post('/sign-upload', protect, authorize('provider'), signUpload);

router.route('/my-portfolio')
  .get(protect, authorize('provider'), getMyPortfolio);

router.route('/:id')
  .get(getPortfolioItemById)
  .put(
    protect, authorize('provider'), 
    upload.fields([{ name: 'images', maxCount: 5 }, { name: 'resume', maxCount: 1 }]), 
    updatePortfolioItem)
  .delete(protect, authorize('provider'), deletePortfolioItem);

module.exports = router;