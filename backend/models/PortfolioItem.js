const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  images: [{
    type: String,
    required: [true, 'Please upload at least one image'],
  }],
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: {
    type: Number, // Years of experience
    default: 0,
  },
  certifications: [{
    name: String,
    issuingOrganization: String,
    dateObtained: Date,
  }],
  resumeUrl: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PortfolioItem', PortfolioItemSchema);