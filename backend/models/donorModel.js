const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Age must be at least 18'],
      max: [70, 'Age must be at most 70'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    organs: {
      type: [String],
      required: [true, 'Organs are required'],
      enum: ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      diabetes: {
        type: Boolean,
        default: false,
      },
      hypertension: {
        type: Boolean,
        default: false,
      },
      heartDisease: {
        type: Boolean,
        default: false,
      },
      other: {
        type: String,
        default: '',
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donor', donorSchema);