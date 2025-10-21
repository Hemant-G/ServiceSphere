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
    const removeFields = ['select', 'sort', 'page', 'limit', 'lat', 'lon', 'distance', 'location'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let query = Service.find(JSON.parse(queryStr));

    // Handle location filtering
    // Priority 1: Geospatial search if coordinates are provided
    if (req.query.lat && req.query.lon) {
      const latitude = parseFloat(req.query.lat);
      const longitude = parseFloat(req.query.lon);
      const distanceInMiles = parseFloat(req.query.distance) || 10;
      // Earth's radius in miles
      const earthRadiusMiles = 3963.2;
      const radius = distanceInMiles / earthRadiusMiles;
 
      // Use MongoDB's native $geoWithin and $centerSphere for clarity and performance
      const geoQuery = {
        location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
      };
      query = query.where(geoQuery);
    } 
    // Priority 2: Text-based location search if no coordinates
    else if (req.query.location) {
      // Find providers in the specified location first
      const providersInLocation = await User.find({
        'address.city': { $regex: `^${req.query.location}`, $options: 'i' }
      }).select('_id');
      const providerIds = providersInLocation.map(p => p._id);
      query = query.where('provider').in(providerIds);
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

    // Get provider's location and add it to the service
    const provider = await User.findById(req.user.id).select('location address');
    if (provider && provider.location) {
      req.body.location = provider.location;
    }

    let service = await Service.create(req.body);
    
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

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
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