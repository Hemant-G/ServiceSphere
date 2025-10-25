const express = require('express');
const {
  createPortfolioItem,
  getProviderPortfolio,
  getMyPortfolio,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioCategories,
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
router.post('/sign-upload', protect, authorize('provider'), async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = require('crypto').createHash('sha1')
      .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest('hex');

    res.json({ success: true, data: { timestamp, signature, api_key: process.env.CLOUDINARY_API_KEY, cloud_name: process.env.CLOUDINARY_CLOUD_NAME } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate signature' });
  }
});

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