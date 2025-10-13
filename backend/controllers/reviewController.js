const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Customer only)
const createReview = async (req, res, next) => {
  try {
    const {
      bookingId,
      rating,
      comment,
      detailedRatings
    } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'name')
      .populate('provider', 'name')
      .populate('service', 'title');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the customer of this booking
    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const review = await Review.create({
      booking: bookingId,
      customer: req.user.id,
      provider: booking.provider._id,
      service: booking.service._id,
      rating,
      comment,
      detailedRatings,
      isVerified: true
    });

    // Populate review details
    await review.populate([
      { path: 'customer', select: 'name avatar' },
      { path: 'provider', select: 'name avatar' },
      { path: 'service', select: 'title' },
      { path: 'booking', select: 'scheduledDate totalPrice' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    let filter = { provider: providerId };

    if (rating) {
      filter.rating = Number(rating);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find(filter)
      .populate('customer', 'name avatar')
      .populate('service', 'title category')
      .populate('booking', 'scheduledDate totalPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(filter);

    // Get average rating and total reviews
    const stats = await Review.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    if (stats.length > 0 && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    res.json({
      success: true,
      count: reviews.length,
      total,
      data: reviews,
      stats: {
        averageRating: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
        totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
        ratingDistribution
      },
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

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
const getServiceReviews = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ service: serviceId })
      .populate('customer', 'name avatar')
      .populate('provider', 'name avatar')
      .populate('booking', 'scheduledDate totalPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ service: serviceId });

    res.json({
      success: true,
      count: reviews.length,
      total,
      data: reviews,
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

// @desc    Get my reviews (for customers)
// @route   GET /api/reviews/my-reviews
// @access  Private (Customer only)
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customer: req.user.id })
      .populate('provider', 'name avatar')
      .populate('service', 'title category')
      .populate('booking', 'scheduledDate totalPrice')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Customer only)
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment, detailedRatings } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment, detailedRatings },
      { new: true, runValidators: true }
    ).populate([
      { path: 'customer', select: 'name avatar' },
      { path: 'provider', select: 'name avatar' },
      { path: 'service', select: 'title' },
      { path: 'booking', select: 'scheduledDate totalPrice' }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Customer only)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats/:providerId
// @access  Public
const getReviewStats = async (req, res, next) => {
  try {
    const { providerId } = req.params;

    const stats = await Review.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          },
          averageQuality: { $avg: '$detailedRatings.quality' },
          averagePunctuality: { $avg: '$detailedRatings.punctuality' },
          averageCommunication: { $avg: '$detailedRatings.communication' },
          averageValue: { $avg: '$detailedRatings.value' }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          detailedRatings: {
            quality: 0,
            punctuality: 0,
            communication: 0,
            value: 0
          }
        }
      });
    }

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating]++;
    });

    res.json({
      success: true,
      data: {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        ratingDistribution,
        detailedRatings: {
          quality: Math.round((stats[0].averageQuality || 0) * 10) / 10,
          punctuality: Math.round((stats[0].averagePunctuality || 0) * 10) / 10,
          communication: Math.round((stats[0].averageCommunication || 0) * 10) / 10,
          value: Math.round((stats[0].averageValue || 0) * 10) / 10
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getServiceReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewStats
};
