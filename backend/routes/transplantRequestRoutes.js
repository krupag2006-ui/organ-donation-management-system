const express = require('express');
const {
  createTransplantRequest,
  getAllTransplantRequests,
  getTransplantRequestById,
  updateTransplantRequest,
  deleteTransplantRequest,
  updateTransplantRequestStatus,
} = require('../controllers/transplantRequestController');

const router = express.Router();

// Transplant request CRUD routes
// Auth protection can be added later if required
router.route('/').post(createTransplantRequest).get(getAllTransplantRequests);
router.route('/:id').get(getTransplantRequestById).put(updateTransplantRequest).delete(deleteTransplantRequest);
router.patch('/:id/status', updateTransplantRequestStatus);

module.exports = router;
