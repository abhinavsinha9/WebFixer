const JsonModel = require('../data/jsonModel');

class BugModel extends JsonModel {
  constructor() {
    super('Bug');
  }

  async create(data) {
    if (!data.bugId) {
      data.bugId = 'BUG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    
    // Default schema values
    data.category = data.category || 'other';
    data.severity = data.severity || 'medium';
    data.priority = data.priority || 'medium';
    data.status = data.status || 'open';
    data.affectedFile = data.affectedFile || '';
    data.affectedLine = data.affectedLine || 0;
    data.codeSnippet = data.codeSnippet || '';
    data.rootCause = data.rootCause || '';
    data.suggestedFix = data.suggestedFix || '';
    data.fixedCode = data.fixedCode || '';
    data.screenshot = data.screenshot || '';
    data.resolution = data.resolution || '';
    data.estimatedTime = data.estimatedTime || '';
    data.actualTime = data.actualTime || '';
    data.labels = data.labels || [];
    data.comments = data.comments || [];
    data.history = data.history || [];

    return super.create(data);
  }
}

module.exports = new BugModel();
