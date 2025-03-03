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
      enum: ['pet_owner', 'service_provider', 'admin'],
      default: 'pet_owner',
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
    // Fields for service providers
    businessName: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String,
    },
    servicesOffered: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }],
    // Fields for pet owners
    pets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
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