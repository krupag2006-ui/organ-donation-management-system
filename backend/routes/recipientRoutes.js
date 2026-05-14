const express = require('express');
const {
  createRecipient,
  getAllRecipients,
  getRecipientById,
  updateRecipient,
  deleteRecipient,
} = require('../controllers/recipientController');

const router = express.Router();

// Recipient CRUD routes
// Auth protection can be added later if required
router.route('/').post(createRecipient).get(getAllRecipients);
router.route('/:id').get(getRecipientById).put(updateRecipient).delete(deleteRecipient);

module.exports = router;
