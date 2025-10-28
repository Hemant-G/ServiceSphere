const mongoose = require('mongoose');
const { PREDEFINED_SERVICES } = require('../utils/serviceConstants');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
}, { _id: false });

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
    type: Number, // duration in minutes,
    required: [true, 'Please provide a duration for the service']
  },
  availability: {
    type: String,
    default: 'Mon-Fri, 9am-5pm'
  },
  address: addressSchema
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);