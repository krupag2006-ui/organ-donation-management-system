const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be at least 1'],
      max: [100, 'Age must be at most 100'],
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
    organNeeded: {
      type: String,
      required: [true, 'Organ needed is required'],
      enum: ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'],
    },
    urgencyLevel: {
      type: String,
      required: [true, 'Urgency level is required'],
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
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
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
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
      kidneyDisease: {
        type: Boolean,
        default: false,
      },
      liverDisease: {
        type: Boolean,
        default: false,
      },
      other: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['Waiting', 'Matched', 'Transplanted', 'Inactive'],
      default: 'Waiting',
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

module.exports = mongoose.model('Recipient', recipientSchema);
