const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authMiddleware');
const {
  createTransplantRequest,
  getAllTransplantRequests,
  getTransplantRequestById,
  updateTransplantRequest,
  deleteTransplantRequest,
  updateTransplantRequestStatus,
} = require('../controllers/transplantRequestController');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin', 'hospital'), createTransplantRequest)
  .get(protect, authorize('admin', 'hospital', 'donor', 'recipient'), getAllTransplantRequests);
router
  .route('/:id')
  .get(protect, authorize('admin', 'hospital', 'donor', 'recipient'), getTransplantRequestById)
  .put(protect, authorize('admin', 'hospital'), updateTransplantRequest)
  .delete(protect, authorize('admin'), deleteTransplantRequest);
router.patch('/:id/status', protect, authorize('admin', 'hospital'), updateTransplantRequestStatus);

module.exports = router;
