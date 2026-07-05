const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  bugId: {
    type: String,
    unique: true,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Bug title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Bug description is required'],
    maxlength: 5000
  },
  category: {
    type: String,
    enum: [
      'broken-link', 'broken-image', '404-page', 'missing-route',
      'unused-file', 'unused-component', 'duplicate-code', 'unused-css',
      'unused-js', 'large-image', 'performance', 'accessibility',
      'seo', 'security', 'console-error', 'api-error', 'memory-leak',
      'infinite-loop', 'missing-alt', 'missing-meta', 'missing-label',
      'responsive', 'color-contrast', 'missing-aria', 'large-bundle',
      'slow-component', 'slow-api', 'render-blocking', 'unused-package',
      'duplicate-dependency', 'form-validation', 'broken-button',
      'broken-navigation', 'api-failure', 'missing-state', 'react-error',
      'type-error', 'reference-error', 'network-error', 'auth-error',
      'route-error', 'database-error', 'permission-error', 'token-error',
      'validation-error', 'loading-bug', 'infinite-loading', 'other'
    ],
    default: 'other'
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'medium'
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'wont-fix'],
    default: 'open'
  },
  affectedFile: {
    type: String,
    default: ''
  },
  affectedLine: {
    type: Number,
    default: 0
  },
  codeSnippet: {
    type: String,
    default: ''
  },
  rootCause: {
    type: String,
    default: ''
  },
  suggestedFix: {
    type: String,
    default: ''
  },
  fixedCode: {
    type: String,
    default: ''
  },
  screenshot: {
    type: String,
    default: ''
  },
  resolution: {
    type: String,
    default: ''
  },
  estimatedTime: {
    type: String,
    default: ''
  },
  actualTime: {
    type: String,
    default: ''
  },
  labels: [String],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  history: [{
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    oldValue: String,
    newValue: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

bugSchema.pre('save', function(next) {
  if (!this.bugId) {
    this.bugId = 'BUG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

bugSchema.index({ project: 1, status: 1 });
bugSchema.index({ severity: 1 });
bugSchema.index({ category: 1 });
bugSchema.index({ bugId: 1 });
bugSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Bug', bugSchema);
