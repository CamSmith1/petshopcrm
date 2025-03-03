const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'dog',
      enum: ['dog', 'other'],
    },
    breed: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
    },
    microchipId: {
      type: String,
      trim: true,
    },
    isNeutered: {
      type: Boolean,
      default: false,
    },
    medicalConditions: [{
      condition: String,
      notes: String,
    }],
    allergies: [{
      type: String,
      trim: true,
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
    }],
    vaccinations: [{
      name: String,
      dateAdministered: Date,
      expiryDate: Date,
    }],
    dietaryRestrictions: {
      type: String,
    },
    behavioralNotes: {
      type: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    photos: [{
      type: String,
    }],
    profilePhoto: {
      type: String,
    },
  },
  { timestamps: true }
);

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;