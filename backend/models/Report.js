const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['bug-report', 'performance', 'accessibility', 'seo', 'security', 'code-quality', 'full-audit', 'improvement', 'documentation'],
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'csv', 'excel', 'json', 'markdown'],
    default: 'pdf'
  },
  status: {
    type: String,
    enum: ['generating', 'ready', 'failed'],
    default: 'generating'
  },
  data: {
    summary: String,
    score: Number,
    totalIssues: Number,
    criticalIssues: Number,
    categories: mongoose.Schema.Types.Mixed,
    recommendations: [String],
    details: mongoose.Schema.Types.Mixed
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

reportSchema.index({ project: 1, type: 1 });
reportSchema.index({ generatedBy: 1 });

// --- Notification Model ---
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['success', 'warning', 'error', 'info', 'bug-found', 'analysis-complete', 'report-ready'],
    default: 'info'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

// --- Activity Model ---
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['project-created', 'project-deleted', 'analysis-started', 'analysis-completed',
           'bug-created', 'bug-updated', 'bug-resolved', 'report-generated',
           'user-login', 'user-signup', 'settings-updated', 'file-uploaded']
  },
  description: {
    type: String,
    default: ''
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = mongoose.model('Report', reportSchema);
module.exports.Notification = Notification;
module.exports.Activity = Activity;
