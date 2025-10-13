const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { BOOKING_STATUS } = require('../utils/serviceConstants.js');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer only)
const createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      providerId,
      scheduledDate,
      notes,
      customerAddress,
      contactPhone,
      paymentMethod = 'cash'
    } = req.body;

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Verify provider matches service
    if (service.provider.toString() !== providerId) {
      return res.status(400).json({
        success: false,
        message: 'Provider does not match service'
      });
    }

    // Check if customer is trying to book their own service
    if (service.provider.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book your own service'
      });
    }

    // Check if scheduled date is in the future
    const scheduledDateTime = new Date(scheduledDate);
    if (scheduledDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future'
      });
    }

    // Handle optional image uploads
    let customerImages = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      customerImages = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      provider: providerId,
      service: serviceId,
      scheduledDate: scheduledDateTime,
      totalPrice: service.price,
      notes,
      customerAddress,
      contactPhone,
      paymentMethod,
      customerImages
    });

    // Populate booking details
    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' },
      { path: 'service', select: 'title description price duration' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'provider') {
      filter.provider = req.user.id;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate('service', 'title description price duration category')
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate('service', 'title description price duration category');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    if (booking.customer._id.toString() !== req.user.id && 
        booking.provider._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'title description price');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization based on role and status change
    const isCustomer = booking.customer._id.toString() === req.user.id;
    const isProvider = booking.provider._id.toString() === req.user.id;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Validate status transitions
    const validTransitions = {
        customer: {
            [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CANCELLED],
            [BOOKING_STATUS.ACCEPTED]: [BOOKING_STATUS.CANCELLED],
        },
        provider: {
            [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.REJECTED],
            [BOOKING_STATUS.ACCEPTED]: [BOOKING_STATUS.IN_PROGRESS],
            [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED],
        }
    };

    const userRole = isCustomer ? 'customer' : 'provider';
    const allowedStatuses = validTransitions[userRole]?.[booking.status] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    // Update booking with timestamps
    const updateData = { status };
    
    if (notes) {
      updateData.notes = notes;
    }

    // Add timestamps for status changes
    switch (status) {
      case 'accepted':
        updateData.acceptedAt = new Date();
        break;
      case 'in-progress':
        updateData.startedAt = new Date();
        break;
      case 'completed':
        updateData.completedAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        updateData.cancelledBy = userRole;
        break;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'customer', select: 'name email phone avatar' },
      { path: 'provider', select: 'name email phone avatar' },
      { path: 'service', select: 'title description price duration' }
    ]);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private
const getBookingStats = async (req, res, next) => {
  try {
    let filter = {};
    
    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'provider') {
      filter.provider = req.user.id;
    }

    // Use Promise.all for more stable parallel execution
    const [stats, totalBookings, totalRevenueResult] = await Promise.all([
      // 1. Get counts for each status
      Booking.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // 2. Get the overall total count of bookings
      Booking.countDocuments(filter),
      // 3. Calculate total revenue from completed bookings
      Booking.aggregate([
        { $match: { ...filter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        stats,
        totalBookings,
        totalRevenue: totalRevenueResult[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  getBookingStats
};
