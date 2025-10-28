const PortfolioItem = require('../models/PortfolioItem');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// Helper to upload a buffer to cloudinary
const uploadBufferToCloudinary = async (buffer, filename, folder = 'portfolio') => {
  // cloudinary.uploader.upload_stream expects a stream; we can use upload_stream with a Promise
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: path.parse(filename).name, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

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

  // Handle file uploads: upload to Cloudinary when files are present (memoryStorage provides buffer)
  if (req.files?.images && req.files.images.length > 0) {
      const uploaded = [];
      try {
        for (const file of req.files.images) {
          // Basic validation: ensure buffer exists
          if (!file.buffer) {
            return res.status(400).json({ success: false, message: 'Invalid file upload' });
          }
          // Limit to 5 images enforced by multer; ensure we don't exceed 5
          if (req.files.images.length > 5) {
            return res.status(400).json({ success: false, message: 'Maximum 5 images allowed' });
          }

          const result = await uploadBufferToCloudinary(file.buffer, file.originalname, 'portfolio');
          // store secure_url and public_id for possible deletion later
          uploaded.push({ url: result.secure_url, public_id: result.public_id });
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(500).json({ success: false, message: 'Failed to upload images. Please try again.' });
      }
      portfolioData.images = uploaded; // store objects {url, public_id}
    } else {
      // This will cause the Mongoose 'required' validation for 'images' to fail if model expects at least one image.
    }

    // Support client-side direct Cloudinary uploads: accept images metadata array in JSON body
    if ((!portfolioData.images || portfolioData.images.length === 0) && req.body.images && Array.isArray(req.body.images)) {
      // Expect each item to be { url, public_id }
      portfolioData.images = req.body.images.map(img => ({ url: img.url, public_id: img.public_id }));
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
    const portfolioItems = await PortfolioItem.find({ provider: req.user.id, isActive: true })
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

    // Handle file uploads (upload new to Cloudinary and remove old ones if present)
    if (req.files) {
      // Handle images
      if (req.files.images) {
        // Delete old Cloudinary images if stored with public_id
        if (portfolioItem.images && portfolioItem.images.length > 0) {
          for (const img of portfolioItem.images) {
            if (img.public_id) {
              try {
                await cloudinary.uploader.destroy(img.public_id, { resource_type: 'image' });
              } catch (e) {
                // ignore deletion errors
              }
            }
          }
        }

        const uploaded = [];
        for (const file of req.files.images) {
          const result = await uploadBufferToCloudinary(file.buffer, file.originalname, 'portfolio');
          uploaded.push({ url: result.secure_url, public_id: result.public_id });
        }
        updateData.images = uploaded;
      }

      // Handle resume (store as resource_type raw or auto)
      if (req.files.resume) {
        // Delete old resume if it was uploaded to Cloudinary
        if (portfolioItem.resumeUrl && portfolioItem.resumePublicId) {
          try {
            await cloudinary.uploader.destroy(portfolioItem.resumePublicId, { resource_type: 'raw' });
          } catch (e) {}
        }

        // Upload new resume
        const resumeFile = req.files.resume[0];
        const resumeResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ resource_type: 'raw', folder: 'portfolio/resumes', public_id: path.parse(resumeFile.originalname).name }, (err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
          stream.end(resumeFile.buffer);
        });

        updateData.resumeUrl = resumeResult.secure_url;
        updateData.resumePublicId = resumeResult.public_id;
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

    // Delete images from Cloudinary if stored with public_id
    if (portfolioItem.images && portfolioItem.images.length > 0) {
      for (const img of portfolioItem.images) {
        if (img.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id, { resource_type: 'image' });
          } catch (e) {
            // ignore
          }
        }
      }
    }

    if (portfolioItem.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(portfolioItem.resumePublicId, { resource_type: 'raw' });
      } catch (e) {}
    }

    await PortfolioItem.findByIdAndDelete(req.params.id);

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

const signUpload = (req, res, next) => {
  const { paramsToSign } = req.body;
  try {
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    res.status(200).json({
      success: true,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME
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
  getPortfolioCategories,
  signUpload
};