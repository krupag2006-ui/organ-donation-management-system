const Donor = require('../models/donorModel');
const mongoose = require('mongoose');

// @desc    Create a new donor
// @route   POST /api/donors
// @access  Public
const createDonor = async (req, res) => {
  try {
    const donor = await Donor.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Donor created successfully',
      data: donor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all donors with optional filters
// @route   GET /api/donors
// @access  Public
const getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, organ, location, availability, status } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (organ) filter.organs = { $in: [organ] };
    if (location) filter.location = location;
    if (availability !== undefined) filter.availability = availability === 'true';
    if (status) filter.status = status;

    const donors = await Donor.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get donor by ID
// @route   GET /api/donors/:id
// @access  Public
const getDonorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID',
      });
    }

    const donor = await Donor.findById(id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update donor by ID
// @route   PUT /api/donors/:id
// @access  Public
const updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID',
      });
    }

    const donor = await Donor.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor updated successfully',
      data: donor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete donor by ID
// @route   DELETE /api/donors/:id
// @access  Public
const deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor ID',
      });
    }

    const donor = await Donor.findByIdAndDelete(id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donor deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};