const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer',
  },
  phone: {
    type: String,
  },
  address: addressSchema,
  // avatar may be a legacy string path or an object { url, public_id } when stored in Cloudinary
  avatar: {
    type: mongoose.Schema.Types.Mixed,
    default: '/uploads/default-avatar.png',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Add geospatial index
userSchema.index({ 'address.city': 'text', 'address.zipCode': 'text' });

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for provider's services
userSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'provider',
  justOne: false,
});

// Virtual for provider's portfolio
userSchema.virtual('portfolio', {
  ref: 'PortfolioItem',
  localField: '_id',
  foreignField: 'provider',
  justOne: false,
});

// Cascade delete services when a provider is deleted (optional, for data integrity)
userSchema.pre('remove', async function (next) {
  if (this.role === 'provider') {
    await this.model('Service').deleteMany({ provider: this._id });
    await this.model('PortfolioItem').deleteMany({ provider: this._id });
    await this.model('Booking').deleteMany({ provider: this._id });
    await this.model('Review').deleteMany({ provider: this._id });
  }
  next();
});


module.exports = mongoose.model('User', userSchema);