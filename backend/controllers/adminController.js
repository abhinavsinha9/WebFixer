const User = require('../models/User');
const Project = require('../models/Project');
const Bug = require('../models/Bug');
const Report = require('../models/Report');
const { Notification, Activity } = require('../models/Report');

// ─── Admin Controller ───────────────────────────────────────────────
// @desc    Get admin dashboard stats
exports.getAdminStats = async (req, res) => {
  try {
    const [userCount, projectCount, bugCount, reportCount] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Bug.countDocuments(),
      Report.countDocuments()
    ]);

    const recentUsers = await User.find().sort('-createdAt').limit(10)
      .select('name email role createdAt lastLogin projectCount');

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const bugsBySeverity = await Bug.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: { users: userCount, projects: projectCount, bugs: bugCount, reports: reportCount },
      recentUsers,
      usersByRole,
      bugsBySeverity
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all users (admin)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit));

    res.json({ success: true, users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user role (admin)
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete user (admin)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get activity logs (admin)
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const total = await Activity.countDocuments();
    const activities = await Activity.find().sort('-createdAt')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .populate('user', 'name email').populate('project', 'name');
    res.json({ success: true, activities, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Notification Controller ────────────────────────────────────────
// @desc    Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt').limit(50).populate('project', 'name slug');
    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark notification as read
exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark all notifications as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Search Controller ──────────────────────────────────────────────
// @desc    Global search
exports.globalSearch = async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Search query required' });

    const results = {};
    const regex = { $regex: q, $options: 'i' };

    if (!type || type === 'projects') {
      results.projects = await Project.find({ owner: req.user.id, $or: [{ name: regex }, { description: regex }] })
        .select('name slug type status scores.overall createdAt').limit(10);
    }

    if (!type || type === 'bugs') {
      const userProjects = await Project.find({ owner: req.user.id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      results.bugs = await Bug.find({ project: { $in: projectIds }, $or: [{ title: regex }, { bugId: regex }, { description: regex }] })
        .select('bugId title severity category status affectedFile').limit(10);
    }

    if (!type || type === 'reports') {
      results.reports = await Report.find({ generatedBy: req.user.id, title: regex })
        .select('title type format createdAt').limit(10);
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Settings Controller ────────────────────────────────────────────
// @desc    Get user settings
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences apiKeys');
    res.json({ success: true, settings: user.preferences, apiKeys: user.apiKeys?.map(k => ({ name: k.name, createdAt: k.createdAt, lastUsed: k.lastUsed })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update settings
exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { preferences: req.body }, { new: true });
    res.json({ success: true, settings: user.preferences });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
