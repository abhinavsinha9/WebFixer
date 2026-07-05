const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/adminController');

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);

module.exports = router;
