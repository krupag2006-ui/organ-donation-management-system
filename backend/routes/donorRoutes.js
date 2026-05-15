const express = require('express');
const {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
} = require('../controllers/donorController');

const router = express.Router();

// Donor CRUD routes
// Auth protection can be added later if required
router.route('/').post(createDonor).get(getAllDonors);
router.route('/:id').get(getDonorById).put(updateDonor).delete(deleteDonor);

module.exports = router;