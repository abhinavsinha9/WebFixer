const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { runAnalysis, getAnalysisResults, getPerformanceAnalysis, getAccessibilityAnalysis, getSEOAnalysis, getSecurityAnalysis } = require('../controllers/analysisController');

router.post('/:projectId', protect, runAnalysis);
router.get('/:projectId', protect, getAnalysisResults);
router.get('/:projectId/performance', protect, getPerformanceAnalysis);
router.get('/:projectId/accessibility', protect, getAccessibilityAnalysis);
router.get('/:projectId/seo', protect, getSEOAnalysis);
router.get('/:projectId/security', protect, getSecurityAnalysis);

module.exports = router;
