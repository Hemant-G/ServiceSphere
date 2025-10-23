const Service = require('../models/Service');
const User = require('../models/User');
const { PREDEFINED_SERVICES } = require('../utils/serviceConstants.js');

// @desc    Get services for the logged-in provider
// @route   GET /api/services/my-services
// @access  Private (Provider)
const getMyServices = async (req, res, next) => {
  try {
    console.log('req.user.id:', req.user.id);
    const services = await Service.find({ provider: req.user.id });
    console.log('services:', services);
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'location'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let query = Service.find(JSON.parse(queryStr));

    // Text-based location search
    if (req.query.location) {
      // Search for services with a matching city in their address.
      // This is more accurate as services can have different locations than their provider's primary address.
      query = query.where({
        'address.city': { $regex: `^${req.query.location}`, $options: 'i' }
      });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // We need to clone the query to get the total count before applying skip/limit
    const totalQuery = query.clone();
    const total = await Service.countDocuments(totalQuery);

    query = query.skip(startIndex).limit(limit).populate('provider', 'name averageRating');

    // Executing query
    const services = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: services.length,
      pagination,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      'provider', 
      'name email phone avatar averageRating totalReviews'
    );

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Provider)
const createService = async (req, res, next) => {
  try {
    req.body.provider = req.user.id;
    const { address, ...serviceData } = req.body;

    // If an address is provided in the form, use it.
    if (address) {
      serviceData.address = address;
    } else {
      // Otherwise, fall back to the provider's profile location.
      const provider = await User.findById(req.user.id).select('address');
      if (provider && provider.address) {
        serviceData.address = provider.address;
      }
    }

    let service = await Service.create(serviceData);
    
    // Populate provider details in the response
    service = await service.populate('provider', 'name averageRating address');

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider)
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this service' });
    }

    const { address, ...updateData } = req.body;

    // Handle address update from the form
    if (address) {
      updateData.address = address;
    }

    service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get predefined service titles
// @route   GET /api/services/predefined
// @access  Public
const getPredefinedServices = (req, res) => {
  res.json({
    success: true,
    data: PREDEFINED_SERVICES
  });
};

module.exports = {
  getAllServices,
  getMyServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getPredefinedServices
};