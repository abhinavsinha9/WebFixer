const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { projectUpload } = require('../middleware/upload');
const { validateProject, validateProjectUrl } = require('../middleware/validation');
const {
  uploadProject, importFromUrl, importFromGithub,
  getProjects, getProject, updateProject, deleteProject,
  getProjectFiles, getFileContent, getDashboardStats
} = require('../controllers/projectController');

router.get('/stats/dashboard', protect, getDashboardStats);
router.post('/upload', protect, projectUpload.single('project'), uploadProject);
router.post('/url', protect, validateProjectUrl, importFromUrl);
router.post('/github', protect, importFromGithub);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.get('/:id/files', protect, getProjectFiles);
router.get('/:id/file/*', protect, getFileContent);

module.exports = router;
