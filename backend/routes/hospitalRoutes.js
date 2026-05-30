const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authMiddleware');
const {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
} = require('../controllers/hospitalController');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin'), createHospital)
  .get(protect, authorize('admin', 'hospital', 'recipient'), getAllHospitals);
router
  .route('/:id')
  .get(protect, authorize('admin', 'hospital', 'recipient'), getHospitalById)
  .put(protect, authorize('admin'), updateHospital)
  .delete(protect, authorize('admin'), deleteHospital);

module.exports = router;
