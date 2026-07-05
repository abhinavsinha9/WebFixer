const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateReport, getProjectReports, getReports, getReport, exportPDF, exportCSV, exportExcel, deleteReport } = require('../controllers/reportController');

router.post('/:projectId', protect, generateReport);
router.get('/project/:projectId', protect, getProjectReports);
router.get('/', protect, getReports);
router.get('/:id', protect, getReport);
router.get('/:id/export/pdf', protect, exportPDF);
router.get('/:id/export/csv', protect, exportCSV);
router.get('/:id/export/excel', protect, exportExcel);
router.delete('/:id', protect, deleteReport);

module.exports = router;
