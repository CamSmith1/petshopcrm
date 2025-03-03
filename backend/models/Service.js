const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      unit: {
        type: String,
        default: 'per_session',
        enum: ['per_session', 'per_hour', 'per_day', 'per_night', 'per_week', 'per_month'],
      },
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['at_provider', 'at_client', 'virtual', 'other'],
        default: 'at_provider',
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      meetingLink: String,
    },
    images: [{
      type: String,
    }],
    availability: {
      monday: [{
        start: String, // HH:MM format
        end: String,   // HH:MM format
      }],
      tuesday: [{
        start: String,
        end: String,
      }],
      wednesday: [{
        start: String,
        end: String,
      }],
      thursday: [{
        start: String,
        end: String,
      }],
      friday: [{
        start: String,
        end: String,
      }],
      saturday: [{
        start: String,
        end: String,
      }],
      sunday: [{
        start: String,
        end: String,
      }],
      customDates: [{
        date: Date,
        slots: [{
          start: String,
          end: String,
        }],
      }],
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    specialRequirements: {
      type: String,
    },
    capacity: {
      type: Number,
      default: 1,
    },
    bufferTime: {
      before: {
        type: Number,
        default: 0,
      },
      after: {
        type: Number,
        default: 0,
      },
    },
    customForms: [{
      title: String,
      description: String,
      fields: [{
        name: String,
        label: String,
        type: String,
        required: Boolean,
        options: [String],
      }],
    }],
    staffMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User.staff',
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
    tags: [{
      type: String,
      trim: true,
    }],
  },
  { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;