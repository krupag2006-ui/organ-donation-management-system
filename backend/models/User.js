const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'donor', 'recipient', 'hospital'],
      default: 'donor',
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    bloodGroup: {
      type: String,
      default: '',
    },
    organ: {
      type: String,
      default: '',
    },
    requiredOrgan: {
      type: String,
      default: '',
    },
    urgency: {
      type: String,
      default: 'Medium',
    },
    hospitalName: {
      type: String,
      trim: true,
      default: '',
    },
    licenseId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
