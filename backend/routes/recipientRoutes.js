const express = require('express');
const protect = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authMiddleware');
const {
  createRecipient,
  getAllRecipients,
  getRecipientById,
  updateRecipient,
  deleteRecipient,
} = require('../controllers/recipientController');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin', 'hospital'), createRecipient)
  .get(protect, authorize('admin', 'hospital'), getAllRecipients);
router
  .route('/:id')
  .get(protect, authorize('admin', 'hospital'), getRecipientById)
  .put(protect, authorize('admin', 'hospital'), updateRecipient)
  .delete(protect, authorize('admin'), deleteRecipient);

module.exports = router;
