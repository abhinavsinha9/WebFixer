const JsonModel = require('../data/jsonModel');

class ProjectModel extends JsonModel {
  constructor() {
    super('Project');
  }

  async create(data) {
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    }
    
    // Default schema values
    data.description = data.description || '';
    data.type = data.type || 'other';
    data.sourceUrl = data.sourceUrl || '';
    data.githubRepo = data.githubRepo || '';
    data.status = data.status || 'importing';
    data.fileCount = data.fileCount || 0;
    data.totalSize = data.totalSize || 0;
    data.language = data.language || '';
    data.framework = data.framework || '';
    data.files = data.files || [];
    data.scores = data.scores || {
      overall: 0, performance: 0, accessibility: 0, seo: 0, security: 0, codeQuality: 0, maintainability: 0
    };
    data.analysis = data.analysis || {
      totalBugs: 0, criticalBugs: 0, warningBugs: 0, infoBugs: 0, fixedBugs: 0
    };
    data.settings = data.settings || {
      autoAnalyze: true, notifyOnBugs: true, analyzeOnPush: false
    };
    data.tags = data.tags || [];
    data.thumbnail = data.thumbnail || '';

    return super.create(data);
  }
}

module.exports = new ProjectModel();
