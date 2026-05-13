const express = require('express');
const {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
} = require('../controllers/hospitalController');

const router = express.Router();

// Hospital CRUD routes
router.route('/').post(createHospital).get(getAllHospitals);
router.route('/:id').get(getHospitalById).put(updateHospital).delete(deleteHospital);

module.exports = router;
