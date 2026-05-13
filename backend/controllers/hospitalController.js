const mongoose = require('mongoose');
const Hospital = require('../models/hospitalModel');

// Create a new hospital record
const createHospital = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Prevent duplicate hospital email
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(409).json({
        success: false,
        message: 'Hospital with this email already exists',
      });
    }

    const hospital = await Hospital.create(req.body);

    return res.status(201).json({
      success: true,
      hospital,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Get all hospitals, with optional filtering by city and emergency availability
const getAllHospitals = async (req, res, next) => {
  try {
    const { city, emergencyAvailable } = req.query;
    const filter = {};

    if (city) {
      filter.city = city;
    }

    if (emergencyAvailable !== undefined) {
      filter.emergencyAvailable = emergencyAvailable === 'true';
    }

    const hospitals = await Hospital.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single hospital by its ID
const getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital ID',
      });
    }

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    return res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    next(error);
  }
};

// Update hospital details by ID
const updateHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital ID',
      });
    }

    if (updates.email) {
      const existingHospital = await Hospital.findOne({
        email: updates.email,
        _id: { $ne: id },
      });
      if (existingHospital) {
        return res.status(409).json({
          success: false,
          message: 'Another hospital with this email already exists',
        });
      }
    }

    const updatedHospital = await Hospital.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedHospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    return res.status(200).json({
      success: true,
      hospital: updatedHospital,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Delete a hospital by ID
const deleteHospital = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital ID',
      });
    }

    const hospital = await Hospital.findByIdAndDelete(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hospital deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
};
