const mongoose = require('mongoose');
const { PREDEFINED_SERVICES } = require('../utils/serviceConstants');

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Service must have a provider']
  },
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    enum: {
      values: PREDEFINED_SERVICES,
      message: 'Service title is not supported'
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  images: [String],
  duration: {
    type: Number, // duration in minutes
    default: 60
  },
  availability: {
    type: String,
    default: 'Mon-Fri, 9am-5pm'
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  }
}, {
  timestamps: true
});

// Add geospatial index
serviceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Service', serviceSchema);