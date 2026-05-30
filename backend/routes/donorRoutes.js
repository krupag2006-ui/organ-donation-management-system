const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authMiddleware');
const {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
} = require('../controllers/donorController');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin', 'hospital'), createDonor)
  .get(protect, authorize('admin', 'hospital', 'recipient'), getAllDonors);
router
  .route('/:id')
  .get(protect, authorize('admin', 'hospital', 'recipient'), getDonorById)
  .put(protect, authorize('admin', 'hospital'), updateDonor)
  .delete(protect, authorize('admin'), deleteDonor);

module.exports = router;
