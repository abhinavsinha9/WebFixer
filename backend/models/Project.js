const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['react', 'nextjs', 'vue', 'html', 'node', 'website', 'other'],
    default: 'other'
  },
  source: {
    type: String,
    enum: ['upload', 'github', 'gitlab', 'url', 'local'],
    required: true
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  githubRepo: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['importing', 'ready', 'analyzing', 'analyzed', 'error'],
    default: 'importing'
  },
  fileCount: { type: Number, default: 0 },
  totalSize: { type: Number, default: 0 },
  language: { type: String, default: '' },
  framework: { type: String, default: '' },
  files: [{
    path: String,
    name: String,
    extension: String,
    size: Number,
    content: String,
    language: String
  }],
  scores: {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    performance: { type: Number, default: 0, min: 0, max: 100 },
    accessibility: { type: Number, default: 0, min: 0, max: 100 },
    seo: { type: Number, default: 0, min: 0, max: 100 },
    security: { type: Number, default: 0, min: 0, max: 100 },
    codeQuality: { type: Number, default: 0, min: 0, max: 100 },
    maintainability: { type: Number, default: 0, min: 0, max: 100 }
  },
  analysis: {
    lastAnalyzed: Date,
    totalBugs: { type: Number, default: 0 },
    criticalBugs: { type: Number, default: 0 },
    warningBugs: { type: Number, default: 0 },
    infoBugs: { type: Number, default: 0 },
    fixedBugs: { type: Number, default: 0 }
  },
  settings: {
    autoAnalyze: { type: Boolean, default: true },
    notifyOnBugs: { type: Boolean, default: true },
    analyzeOnPush: { type: Boolean, default: false }
  },
  tags: [String],
  thumbnail: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

projectSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  }
  next();
});

projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ slug: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
