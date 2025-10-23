const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get provider profile
// @route   GET /api/providers/profile
// @access  Private (Provider only)
const getProviderProfile = async (req, res, next) => {
  try {
    const provider = await User.findById(req.user.id)
      .select('-password');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (Provider only)
const updateProviderProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const updateData = { name, phone, address, avatar };

    const provider = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider statistics
// @route   GET /api/providers/stats
// @access  Private (Provider only)
const getProviderStats = async (req, res, next) => {
  try {
    const providerId = req.user.id;

    // Get service statistics
    const serviceStats = await Service.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          averageServicePrice: { $avg: '$price' }
        }
      }
    ]);

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    // Calculate total revenue
    const totalRevenue = await Booking.aggregate([
      { $match: { provider: providerId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      success: true,
      data: {
        services: serviceStats[0] || {
          totalServices: 0,
          activeServices: 0,
          averageServicePrice: 0
        },
        bookings: bookingStats,
        reviews: reviewStats[0] || {
          averageRating: 0,
          totalReviews: 0
        },
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider services
// @route   GET /api/providers/services
// @access  Private (Provider only)
const getProviderServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider bookings
// @route   GET /api/providers/bookings
// @access  Private (Provider only)
const getProviderBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { provider: req.user.id };
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone avatar')
      .populate('service', 'title description price duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      count: bookings.length,
      total,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProviderProfile,
  updateProviderProfile,
  getProviderStats,
  getProviderServices,
  getProviderBookings
};
