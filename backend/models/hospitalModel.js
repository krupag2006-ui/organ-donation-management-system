const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    availableOrgans: {
      type: [String],
      default: [],
    },
    capacity: {
      type: Number,
      default: 0,
    },
    emergencyAvailable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'hospitals',
  }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
