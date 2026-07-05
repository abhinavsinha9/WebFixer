const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminStats, getUsers, updateUserRole, deleteUser, getActivityLogs } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/activity', getActivityLogs);

module.exports = router;
