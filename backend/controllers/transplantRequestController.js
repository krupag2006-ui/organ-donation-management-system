const mongoose = require('mongoose');
const TransplantRequest = require('../models/transplantRequestModel');
let Donor;
let Recipient;
try {
  Donor = require('../models/donorModel');
} catch (err) {
  Donor = mongoose.models.Donor;
}
try {
  Recipient = require('../models/recipientModel');
} catch (err) {
  Recipient = mongoose.models.Recipient;
}
const Hospital = require('../models/hospitalModel');

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const findEntities = async (donorId, recipientId, hospitalId) => {
  const [donor, recipient, hospital] = await Promise.all([
    Donor.findById(donorId),
    Recipient.findById(recipientId),
    Hospital.findById(hospitalId),
  ]);
  return { donor, recipient, hospital };
};

// @desc    Create a new transplant request
// @route   POST /api/transplant-requests
// @access  Public
const createTransplantRequest = async (req, res) => {
  try {
    const { donor, recipient, hospital, organ, bloodGroup } = req.body;

    if (!validateObjectId(donor)) {
      return res.status(400).json({ success: false, message: 'Invalid donor ID' });
    }
    if (!validateObjectId(recipient)) {
      return res.status(400).json({ success: false, message: 'Invalid recipient ID' });
    }
    if (!validateObjectId(hospital)) {
      return res.status(400).json({ success: false, message: 'Invalid hospital ID' });
    }

    const { donor: donorRecord, recipient: recipientRecord, hospital: hospitalRecord } =
      await findEntities(donor, recipient, hospital);

    if (!donorRecord) {
      return res.status(400).json({ success: false, message: 'Donor not found' });
    }
    if (!recipientRecord) {
      return res.status(400).json({ success: false, message: 'Recipient not found' });
    }
    if (!hospitalRecord) {
      return res.status(400).json({ success: false, message: 'Hospital not found' });
    }

    if (!donorRecord.availability) {
      return res.status(400).json({ success: false, message: 'Donor is not available' });
    }

    if (!donorRecord.organs.includes(organ)) {
      return res.status(400).json({ success: false, message: 'Donor does not have requested organ' });
    }

    if (recipientRecord.organNeeded !== organ) {
      return res.status(400).json({ success: false, message: 'Recipient does not need requested organ' });
    }

    if (donorRecord.bloodGroup !== bloodGroup || recipientRecord.bloodGroup !== bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Blood group does not match donor or recipient',
      });
    }

    const transplantRequest = await TransplantRequest.create(req.body);
    const populatedRequest = await transplantRequest
      .populate('donor')
      .populate('recipient')
      .populate('hospital');

    return res.status(201).json({
      success: true,
      message: 'Transplant request created successfully',
      data: populatedRequest,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all transplant requests
// @route   GET /api/transplant-requests
// @access  Public
const getAllTransplantRequests = async (req, res) => {
  try {
    const { donor, recipient, hospital, organ, bloodGroup, priority, status } = req.query;
    const filter = {};

    if (donor) {
      if (!validateObjectId(donor)) {
        return res.status(400).json({ success: false, message: 'Invalid donor ID' });
      }
      filter.donor = donor;
    }
    if (recipient) {
      if (!validateObjectId(recipient)) {
        return res.status(400).json({ success: false, message: 'Invalid recipient ID' });
      }
      filter.recipient = recipient;
    }
    if (hospital) {
      if (!validateObjectId(hospital)) {
        return res.status(400).json({ success: false, message: 'Invalid hospital ID' });
      }
      filter.hospital = hospital;
    }
    if (organ) filter.organ = organ;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const transplantRequests = await TransplantRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('donor')
      .populate('recipient')
      .populate('hospital');

    return res.status(200).json({
      success: true,
      count: transplantRequests.length,
      data: transplantRequests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get transplant request by ID
// @route   GET /api/transplant-requests/:id
// @access  Public
const getTransplantRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transplant request ID' });
    }

    const transplantRequest = await TransplantRequest.findById(id)
      .populate('donor')
      .populate('recipient')
      .populate('hospital');

    if (!transplantRequest) {
      return res.status(404).json({ success: false, message: 'Transplant request not found' });
    }

    return res.status(200).json({ success: true, data: transplantRequest });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update transplant request by ID
// @route   PUT /api/transplant-requests/:id
// @access  Public
const updateTransplantRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transplant request ID' });
    }

    const allowedUpdates = ['priority', 'status', 'scheduledDate', 'notes', 'rejectionReason'];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const transplantRequest = await TransplantRequest.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('donor')
      .populate('recipient')
      .populate('hospital');

    if (!transplantRequest) {
      return res.status(404).json({ success: false, message: 'Transplant request not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Transplant request updated successfully',
      data: transplantRequest,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update transplant request status only
// @route   PATCH /api/transplant-requests/:id/status
// @access  Public
const updateTransplantRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transplant request ID' });
    }

    const allowedStatuses = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const transplantRequest = await TransplantRequest.findById(id);
    if (!transplantRequest) {
      return res.status(404).json({ success: false, message: 'Transplant request not found' });
    }

    const donorRecord = await Donor.findById(transplantRequest.donor);
    const recipientRecord = await Recipient.findById(transplantRequest.recipient);

    if (!donorRecord || !recipientRecord) {
      return res.status(400).json({ success: false, message: 'Related donor or recipient not found' });
    }

    transplantRequest.status = status;
    if (status === 'Rejected' && rejectionReason !== undefined) {
      transplantRequest.rejectionReason = rejectionReason;
    }

    if (status === 'Approved') {
      recipientRecord.status = 'Matched';
      donorRecord.status = 'Verified';
      await Promise.all([recipientRecord.save(), donorRecord.save()]);
    }

    if (status === 'Completed') {
      recipientRecord.status = 'Transplanted';
      donorRecord.availability = false;
      await Promise.all([recipientRecord.save(), donorRecord.save()]);
    }

    if (status === 'Cancelled' || status === 'Rejected') {
      if (recipientRecord.status === 'Matched') {
        recipientRecord.status = 'Waiting';
        await recipientRecord.save();
      }
    }

    await transplantRequest.save();
    const populatedRequest = await TransplantRequest.findById(id)
      .populate('donor')
      .populate('recipient')
      .populate('hospital');

    return res.status(200).json({
      success: true,
      message: 'Transplant request status updated successfully',
      data: populatedRequest,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete transplant request by ID
// @route   DELETE /api/transplant-requests/:id
// @access  Public
const deleteTransplantRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid transplant request ID' });
    }

    const transplantRequest = await TransplantRequest.findByIdAndDelete(id);
    if (!transplantRequest) {
      return res.status(404).json({ success: false, message: 'Transplant request not found' });
    }

    return res.status(200).json({ success: true, message: 'Transplant request deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createTransplantRequest,
  getAllTransplantRequests,
  getTransplantRequestById,
  updateTransplantRequest,
  deleteTransplantRequest,
  updateTransplantRequestStatus,
};
