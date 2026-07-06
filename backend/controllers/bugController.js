const Bug = require('../models/Bug');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get bugs for a project
// @route   GET /api/bugs/project/:projectId
exports.getBugs = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, category, status, priority, sort = '-createdAt', search } = req.query;

    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const query = { project: req.params.projectId };
    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { bugId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Bug.countDocuments(query);
    const bugs = await Bug.find(query)
      .populate('assignedTo', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      bugs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single bug
// @route   GET /api/bugs/:id
exports.getBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('assignedTo', 'name avatar email')
      .populate('reportedBy', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug not found' });
    }

    res.json({ success: true, bug });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update bug
// @route   PUT /api/bugs/:id
exports.updateBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug not found' });
    }

    const allowedUpdates = ['status', 'severity', 'priority', 'assignedTo', 'resolution', 'labels', 'fixedCode', 'actualTime'];
    const updates = {};
    const historyEntries = [];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== bug[field]) {
        historyEntries.push({
          action: `Changed ${field}`,
          user: req.user.id,
          oldValue: String(bug[field]),
          newValue: String(req.body[field])
        });
        updates[field] = req.body[field];
      }
    });

    if (historyEntries.length > 0) {
      updates.$push = { history: { $each: historyEntries } };
    }

    // If bug is resolved, update project stats
    if (updates.status === 'resolved' && bug.status !== 'resolved') {
      await Project.findByIdAndUpdate(bug.project, {
        $inc: { 'analysis.fixedBugs': 1 }
      });
      await User.findByIdAndUpdate(req.user.id, { $inc: { bugsFixed: 1 } });
    }

    const updatedBug = await Bug.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('assignedTo', 'name avatar');

    res.json({ success: true, bug: updatedBug });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add comment to bug
// @route   POST /api/bugs/:id/comments
exports.addComment = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: req.user.id, text: req.body.text } } },
      { new: true }
    ).populate('comments.user', 'name avatar');

    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug not found' });
    }

    res.json({ success: true, comments: bug.comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
exports.deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findByIdAndDelete(req.params.id);
    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug not found' });
    }

    await Project.findByIdAndUpdate(bug.project, {
      $inc: { 'analysis.totalBugs': -1 }
    });

    res.json({ success: true, message: 'Bug deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get bug statistics for a project
// @route   GET /api/bugs/stats/:projectId
exports.getBugStats = async (req, res) => {
  try {
    const [severityStats, categoryStats, statusStats, timeline] = await Promise.all([
      Bug.aggregate([
        { $match: { project: req.params.projectId } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Bug.aggregate([
        { $match: { project: req.params.projectId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Bug.aggregate([
        { $match: { project: req.params.projectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Bug.aggregate([
        { $match: { project: req.params.projectId } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        severity: severityStats,
        categories: categoryStats,
        status: statusStats,
        timeline
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
