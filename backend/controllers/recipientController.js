const mongoose = require('mongoose');
const Recipient = require('../models/recipientModel');

const urgencyOrder = ['Critical', 'High', 'Medium', 'Low'];

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new recipient
// @route   POST /api/recipients
// @access  Public
const createRecipient = async (req, res) => {
  try {
    const { hospital } = req.body;

    if (hospital && !validateObjectId(hospital)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital ID',
      });
    }

    const recipient = await Recipient.create({
      ...req.body,
      registeredBy: req.user?._id,
    });
    return res.status(201).json({
      success: true,
      message: 'Recipient created successfully',
      data: recipient,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all recipients with optional filters
// @route   GET /api/recipients
// @access  Public
const getAllRecipients = async (req, res) => {
  try {
    const { bloodGroup, organNeeded, location, urgencyLevel, status, hospital } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (organNeeded) filter.organNeeded = organNeeded;
    if (location) filter.location = location;
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
    if (status) filter.status = status;
    if (hospital) {
      if (!validateObjectId(hospital)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid hospital ID',
        });
      }
      filter.hospital = hospital;
    }

    let recipients = await Recipient.find(filter).populate('hospital');

    // Sort by urgency priority first, then newest first within same urgency.
    recipients = recipients.sort((a, b) => {
      const urgencyA = urgencyOrder.indexOf(a.urgencyLevel);
      const urgencyB = urgencyOrder.indexOf(b.urgencyLevel);

      if (urgencyA !== urgencyB) {
        return urgencyA - urgencyB;
      }
      return b.createdAt - a.createdAt;
    });

    return res.status(200).json({
      success: true,
      count: recipients.length,
      data: recipients,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get recipient by ID
// @route   GET /api/recipients/:id
// @access  Public
const getRecipientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID',
      });
    }

    const recipient = await Recipient.findById(id).populate('hospital');
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: recipient,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update recipient by ID
// @route   PUT /api/recipients/:id
// @access  Public
const updateRecipient = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospital } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID',
      });
    }

    if (hospital && !validateObjectId(hospital)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital ID',
      });
    }

    const recipient = await Recipient.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('hospital');

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recipient updated successfully',
      data: recipient,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete recipient by ID
// @route   DELETE /api/recipients/:id
// @access  Public
const deleteRecipient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID',
      });
    }

    const recipient = await Recipient.findByIdAndDelete(id);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recipient deleted successfully',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRecipient,
  getAllRecipients,
  getRecipientById,
  updateRecipient,
  deleteRecipient,
};
