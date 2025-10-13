const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Review must belong to a booking'],
    unique: true // One review per booking
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a customer']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a provider']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Review must be for a service']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  // Detailed ratings (optional)
  detailedRatings: {
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
reviewSchema.index({ provider: 1, rating: -1 });
reviewSchema.index({ service: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ createdAt: -1 });

// Pre-save middleware to validate booking status
reviewSchema.pre('save', async function(next) {
  const booking = await mongoose.model('Booking').findById(this.booking);
  if (!booking) {
    return next(new Error('Booking not found'));
  }
  if (booking.status !== 'completed') {
    return next(new Error('Can only review completed bookings'));
  }
  next();
});

// Post-save middleware to update service and provider ratings
reviewSchema.post('save', async function() {
  await this.constructor.updateServiceRating(this.service);
  await this.constructor.updateProviderRating(this.provider);
});

// Static method to update service average rating
reviewSchema.statics.updateServiceRating = async function(serviceId) {
  const stats = await this.aggregate([
    { $match: { service: serviceId } },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Service').findByIdAndUpdate(serviceId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  }
};

// Static method to update provider average rating
reviewSchema.statics.updateProviderRating = async function(providerId) {
  const stats = await this.aggregate([
    { $match: { provider: providerId } },
    {
      $group: {
        _id: '$provider',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(providerId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  }
};

module.exports = mongoose.model('Review', reviewSchema);
