const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['client', 'business', 'admin'],
      default: 'client',
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Fields for business users
    businessName: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String,
    },
    businessCategory: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    servicesOffered: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }],
    businessHours: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }],
    },
    staff: [{
      name: String,
      email: String,
      role: String,
      schedule: Map,
    }],
    // Fields for clients
    clients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    }],
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    // Shared fields
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    stripeCustomerId: String,
    stripeAccountId: String,
    apiKeys: [{
      key: String,
      name: String,
      createdAt: Date,
      lastUsed: Date,
    }],
    widgetSettings: {
      theme: {
        primaryColor: String,
        secondaryColor: String,
        fontFamily: String,
        borderRadius: String,
      },
      layout: String,
      customCss: String,
    },
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;