const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateBug, validateBugUpdate } = require('../middleware/validation');
const { getBugs, getBug, updateBug, addComment, deleteBug, getBugStats } = require('../controllers/bugController');

router.get('/project/:projectId', protect, getBugs);
router.get('/stats/:projectId', protect, getBugStats);
router.get('/:id', protect, getBug);
router.put('/:id', protect, validateBugUpdate, updateBug);
router.post('/:id/comments', protect, addComment);
router.delete('/:id', protect, deleteBug);

module.exports = router;
