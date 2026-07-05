const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSuggestions, getCodeReview, generateDocs } = require('../controllers/aiController');

router.post('/:projectId/suggestions', protect, getSuggestions);
router.post('/:projectId/review', protect, getCodeReview);
router.post('/:projectId/docs', protect, generateDocs);

module.exports = router;
