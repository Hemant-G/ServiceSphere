const PortfolioItem = require('../models/PortfolioItem');
const path = require('path');
const fs = require('fs');

// @desc    Create portfolio item
// @route   POST /api/portfolio
// @access  Private (Provider only)
const createPortfolioItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      experience,
      certifications,
      featured
    } = req.body;

    // Prepare portfolio data
    const portfolioData = {
      provider: req.user.id,
      title,
      description,
      category,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
      experience: experience ? Number(experience) : 0,
      featured: featured === 'true',
      certifications: certifications ? JSON.parse(certifications) : []
    };

    // Handle file uploads
    if (req.files?.images?.length > 0) {
      portfolioData.images = req.files.images.map(file => `/uploads/${file.filename}`);
    } else {
      // This will cause the Mongoose 'required' validation for 'images' to fail, which is correct.
      // The model requires at least one image.
    }

    const portfolioItem = await PortfolioItem.create(portfolioData);

    res.status(201).json({
      success: true,
      message: 'Portfolio item created successfully',
      data: portfolioItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider portfolio
// @route   GET /api/portfolio/provider/:providerId
// @access  Public
const getProviderPortfolio = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { category, featured } = req.query;

    let filter = {
      provider: providerId,
      isActive: true
    };

    if (category) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    const portfolioItems = await PortfolioItem.find(filter)
      .populate('provider', 'name email phone avatar averageRating totalReviews')
      .sort({ featured: -1, createdAt: -1 });

    res.json({
      success: true,
      count: portfolioItems.length,
      data: portfolioItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my portfolio items
// @route   GET /api/portfolio/my-portfolio
// @access  Private (Provider only)
const getMyPortfolio = async (req, res, next) => {
  try {
    const portfolioItems = await PortfolioItem.find({ provider: req.user.id })
      .populate('provider', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: portfolioItems.length,
      data: portfolioItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single portfolio item
// @route   GET /api/portfolio/:id
// @access  Public
const getPortfolioItemById = async (req, res, next) => {
  try {
    const portfolioItem = await PortfolioItem.findById(req.params.id)
      .populate('provider', 'name email phone avatar averageRating totalReviews');

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    res.json({
      success: true,
      data: portfolioItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update portfolio item
// @route   PUT /api/portfolio/:id
// @access  Private (Provider only)
const updatePortfolioItem = async (req, res, next) => {
  try {
    let portfolioItem = await PortfolioItem.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Check if user owns the portfolio item
    if (portfolioItem.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this portfolio item'
      });
    }

    const {
      title,
      description,
      category,
      skills,
      experience,
      certifications,
      featured
    } = req.body;

    // Prepare update data
    const updateData = {
      title,
      description,
      category,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : portfolioItem.skills,
      experience: experience ? Number(experience) : portfolioItem.experience,
      featured: featured === 'true',
      certifications: certifications ? JSON.parse(certifications) : portfolioItem.certifications
    };

    // Handle file uploads
    if (req.files) {
      // Handle images
      if (req.files.images) {
        // Delete old images
        portfolioItem.images.forEach(image => {
          const imagePath = path.join(__dirname, '..', image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
        
        updateData.images = req.files.images.map(file => `/uploads/${file.filename}`);
      }

      // Handle resume
      if (req.files.resume) {
        // Delete old resume
        if (portfolioItem.resumeUrl) {
          const resumePath = path.join(__dirname, '..', portfolioItem.resumeUrl);
          if (fs.existsSync(resumePath)) {
            fs.unlinkSync(resumePath);
          }
        }
        
        updateData.resumeUrl = `/uploads/${req.files.resume[0].filename}`;
      }
    }

    portfolioItem = await PortfolioItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('provider', 'name email phone avatar');

    res.json({
      success: true,
      message: 'Portfolio item updated successfully',
      data: portfolioItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private (Provider only)
const deletePortfolioItem = async (req, res, next) => {
  try {
    const portfolioItem = await PortfolioItem.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Check if user owns the portfolio item
    if (portfolioItem.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this portfolio item'
      });
    }

    // Delete files from filesystem
    portfolioItem.images.forEach(image => {
      const imagePath = path.join(__dirname, '..', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    if (portfolioItem.resumeUrl) {
      const resumePath = path.join(__dirname, '..', portfolioItem.resumeUrl);
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }
    }

    // Soft delete
    portfolioItem.isActive = false;
    await portfolioItem.save();

    res.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get portfolio categories
// @route   GET /api/portfolio/categories
// @access  Public
const getPortfolioCategories = async (req, res, next) => {
  try {
    const categories = await PortfolioItem.distinct('category', { isActive: true });
    
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const count = await PortfolioItem.countDocuments({ category, isActive: true });
        return { category, count };
      })
    );

    res.json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPortfolioItem,
  getProviderPortfolio,
  getMyPortfolio,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
  getPortfolioCategories
};
