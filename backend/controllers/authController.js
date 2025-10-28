const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadBufferToCloudinary = (buffer, filename, folder = 'avatars') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, public_id: filename.split('.')[0] }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone,
      address
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};

    if (name) updateData.name = name; // This will be a string from form-data
    if (phone) updateData.phone = phone; // This will be a string from form-data

    // When using multipart/form-data, nested objects are sent as strings.
    // We need to parse the address string back into an object.
    if (address) {
      const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      // Use dot notation to update nested address fields without overwriting the whole object.
      // This prevents fields from being wiped if only a partial address is sent.
      Object.keys(parsedAddress).forEach(key => {
        if (parsedAddress[key]) {
          updateData[`address.${key}`] = parsedAddress[key];
        }
      });
    }

    // Check if a file was uploaded
    if (req.file && req.file.buffer) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname, `avatars/${req.user.id}`);
        updateData.avatar = { url: result.secure_url, public_id: result.public_id };
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to upload avatar' });
      }
    }

    // If there's data to update (text fields or avatar), perform the update.
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true, runValidators: true, context: 'query' }
      );
    }

    // Always fetch the latest user data to ensure the response is up-to-date,
    // especially after an avatar-only upload.
    const user = await User.findById(req.user.id);

    // Send back the full, updated user object.
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public user profile
// @route   GET /api/auth/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'services',
        select: 'title description price category averageRating',
      })
      .populate({
        path: 'portfolio',
        select: 'title images category featured',
        options: { limit: 6, sort: { featured: -1, createdAt: -1 } },
      });

    if (!user || user.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Only return public data
    const { _id, name, avatar, services, portfolio, averageRating, totalReviews, createdAt } = user;

    res.json({ success: true, data: { _id, name, avatar, services, portfolio, averageRating, totalReviews, createdAt } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUserProfile,
};
