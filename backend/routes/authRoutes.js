const express = require('express');
const {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  updateAvatar,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/users/:id', getUserProfile);

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Avatar upload route
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;