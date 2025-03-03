const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    assignedStaff: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'],
      default: 'pending',
    },
    totalPrice: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'partially_refunded', 'failed'],
      default: 'pending',
    },
    paymentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    customFormData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notes: {
      client: {
        type: String,
      },
      provider: {
        type: String,
      },
      internal: {
        type: String,
      },
    },
    location: {
      type: String,
      enum: ['at_provider', 'at_client', 'virtual', 'other'],
      required: true,
    },
    meetingLink: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    cancellationTime: {
      type: Date,
    },
    cancellationBy: {
      type: String,
      enum: ['client', 'provider', 'admin', 'system'],
    },
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      },
      endDate: {
        type: Date,
      },
      occurrences: {
        type: Number,
      },
      linkedBookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      }],
    },
    remindersSent: [{
      type: {
        type: String,
        enum: ['email', 'sms'],
      },
      sentAt: Date,
    }],
    attachments: [{
      type: String,
      description: String,
    }],
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      date: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;