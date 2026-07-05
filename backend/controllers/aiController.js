const Project = require('../models/Project');

// AI Service - uses OpenAI when available, falls back to rule-based analysis
const getAIClient = () => {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key') {
    const OpenAI = require('openai');
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
};

// Rule-based fallback suggestions
const generateRuleBasedSuggestions = (files, type) => {
  const suggestions = [];
  const jsFiles = files.filter(f => ['.js', '.jsx', '.ts', '.tsx'].includes(f.extension));
  const cssFiles = files.filter(f => ['.css', '.scss'].includes(f.extension));
  const htmlFiles = files.filter(f => ['.html', '.htm'].includes(f.extension));

  if (type === 'code' || type === 'all') {
    jsFiles.forEach(file => {
      if (!file.content) return;
      if (file.content.includes('var ')) suggestions.push({ type: 'code', title: 'Use const/let instead of var', file: file.path, description: 'Replace var declarations with const (for constants) or let (for reassigned variables) for better scoping and code quality.', priority: 'medium' });
      if (file.content.includes('console.log')) suggestions.push({ type: 'code', title: 'Remove console.log statements', file: file.path, description: 'Console statements should be removed in production. Use a proper logging library like winston or pino for backend, and conditionally log in development only.', priority: 'low' });
      if (file.content.includes('== ') || file.content.includes("== '")) suggestions.push({ type: 'code', title: 'Use strict equality (===)', file: file.path, description: 'Replace loose equality (==) with strict equality (===) to avoid type coercion bugs.', priority: 'medium' });
      if (file.content.length > 10000) suggestions.push({ type: 'refactoring', title: 'Split large file into modules', file: file.path, description: `This file is ${Math.round(file.content.length / 1024)}KB. Break it into smaller, focused modules following single responsibility principle.`, priority: 'medium' });
      if (file.content.includes('catch (') && file.content.includes('catch (e) {}')) suggestions.push({ type: 'code', title: 'Handle caught errors properly', file: file.path, description: 'Empty catch blocks swallow errors silently. Log the error or handle it appropriately.', priority: 'high' });
      if (file.content.includes('.then(') && file.content.includes('.catch(')) suggestions.push({ type: 'code', title: 'Consider async/await over .then()', file: file.path, description: 'Refactor promise chains to use async/await for cleaner, more readable async code.', priority: 'low' });
    });
  }

  if (type === 'performance' || type === 'all') {
    const totalJsSize = jsFiles.reduce((s, f) => s + (f.size || 0), 0);
    if (totalJsSize > 500000) suggestions.push({ type: 'performance', title: 'Implement code splitting', description: `Total JS size is ${Math.round(totalJsSize / 1024)}KB. Use dynamic imports and React.lazy() to split code into smaller chunks.`, priority: 'high' });
    const imageFiles = files.filter(f => ['.png', '.jpg', '.jpeg', '.gif'].includes(f.extension));
    imageFiles.forEach(f => {
      if (f.size > 200000) suggestions.push({ type: 'performance', title: `Optimize image: ${f.name}`, file: f.path, description: `Image is ${Math.round(f.size / 1024)}KB. Convert to WebP format and use responsive image sizes with srcset.`, priority: 'medium' });
    });
    suggestions.push({ type: 'performance', title: 'Enable compression', description: 'Enable gzip or brotli compression on your server to reduce transfer size by 60-80%.', priority: 'high' });
    suggestions.push({ type: 'performance', title: 'Implement caching strategy', description: 'Set Cache-Control headers for static assets and implement service worker for offline support.', priority: 'medium' });
  }

  if (type === 'security' || type === 'all') {
    const packageJson = files.find(f => f.name === 'package.json');
    if (packageJson) {
      suggestions.push({ type: 'security', title: 'Run npm audit regularly', description: 'Regularly run npm audit to check for known vulnerabilities in dependencies.', priority: 'high' });
    }
    suggestions.push({ type: 'security', title: 'Implement Content Security Policy', description: 'Add CSP headers to prevent XSS attacks and control resource loading.', priority: 'high' });
    suggestions.push({ type: 'security', title: 'Use HTTPS everywhere', description: 'Ensure all resources are loaded over HTTPS. Set up HSTS headers.', priority: 'high' });
    suggestions.push({ type: 'security', title: 'Implement rate limiting', description: 'Add rate limiting to API endpoints to prevent abuse and DDoS attacks.', priority: 'medium' });
  }

  if (type === 'accessibility' || type === 'all') {
    suggestions.push({ type: 'accessibility', title: 'Add skip navigation link', description: 'Add a "Skip to main content" link for keyboard navigation users.', priority: 'medium' });
    suggestions.push({ type: 'accessibility', title: 'Ensure color contrast ratio', description: 'All text should have a contrast ratio of at least 4.5:1 against its background (WCAG AA).', priority: 'medium' });
    suggestions.push({ type: 'accessibility', title: 'Add focus indicators', description: 'Ensure all interactive elements have visible focus indicators for keyboard users.', priority: 'medium' });
  }

  if (type === 'seo' || type === 'all') {
    suggestions.push({ type: 'seo', title: 'Add structured data (JSON-LD)', description: 'Implement Schema.org structured data to enhance search result appearance with rich snippets.', priority: 'medium' });
    suggestions.push({ type: 'seo', title: 'Optimize meta descriptions', description: 'Each page should have a unique meta description between 120-160 characters.', priority: 'medium' });
    suggestions.push({ type: 'seo', title: 'Create XML sitemap', description: 'Generate an XML sitemap and submit it to search engines for better indexing.', priority: 'low' });
  }

  if (type === 'architecture' || type === 'all') {
    suggestions.push({ type: 'architecture', title: 'Follow component-based architecture', description: 'Break UI into small, reusable components. Each component should have a single responsibility.', priority: 'medium' });
    suggestions.push({ type: 'architecture', title: 'Implement error boundaries', description: 'Add React Error Boundaries to catch and gracefully handle component errors.', priority: 'medium' });
    suggestions.push({ type: 'architecture', title: 'Use environment variables', description: 'Move all configuration values to environment variables. Never hardcode secrets or API keys.', priority: 'high' });
  }

  return suggestions;
};

// @desc    Get AI suggestions for a project
// @route   POST /api/ai/:projectId/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { type = 'all' } = req.body;

    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const openai = getAIClient();

    if (openai) {
      // Use OpenAI for intelligent suggestions
      try {
        const fileSummary = project.files.slice(0, 20).map(f =>
          `File: ${f.path} (${f.extension}, ${f.size}B)\n${f.content?.substring(0, 500) || '(binary)'}`
        ).join('\n---\n');

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You are a senior software engineer. Analyze the following project files and provide specific, actionable improvement suggestions. Return a JSON array of objects with: type (code/performance/security/accessibility/seo/architecture/refactoring), title, description, file (if applicable), priority (high/medium/low).'
          }, {
            role: 'user',
            content: `Analyze this ${project.type} project "${project.name}" for ${type} improvements:\n\n${fileSummary}`
          }],
          response_format: { type: 'json_object' },
          max_tokens: 2000
        });

        const aiSuggestions = JSON.parse(completion.choices[0].message.content);
        return res.json({
          success: true,
          source: 'ai',
          suggestions: aiSuggestions.suggestions || aiSuggestions
        });
      } catch (aiError) {
        console.error('OpenAI error, falling back to rule-based:', aiError.message);
      }
    }

    // Fallback to rule-based analysis
    const suggestions = generateRuleBasedSuggestions(project.files, type);

    res.json({
      success: true,
      source: 'rule-based',
      suggestions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get AI code review for a specific file
// @route   POST /api/ai/:projectId/review
exports.getCodeReview = async (req, res) => {
  try {
    const { filePath } = req.body;

    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const file = project.files.find(f => f.path === filePath);
    if (!file) return res.status(404).json({ success: false, error: 'File not found' });

    const openai = getAIClient();

    if (openai && file.content) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You are a code reviewer. Analyze the code and provide: 1) A brief summary, 2) List of issues found, 3) Suggestions for improvement, 4) An improved version of critical sections. Return as JSON with keys: summary, issues (array of {line, issue, severity}), suggestions (array of strings), improvedCode (string, optional).'
          }, {
            role: 'user',
            content: `Review this ${file.language} file "${file.path}":\n\n${file.content.substring(0, 4000)}`
          }],
          response_format: { type: 'json_object' },
          max_tokens: 2000
        });

        const review = JSON.parse(completion.choices[0].message.content);
        return res.json({ success: true, source: 'ai', review });
      } catch (aiError) {
        console.error('OpenAI review error:', aiError.message);
      }
    }

    // Fallback review
    const issues = [];
    const suggestions = [];
    const lines = (file.content || '').split('\n');

    lines.forEach((line, i) => {
      if (line.includes('console.log')) issues.push({ line: i + 1, issue: 'Console statement found', severity: 'low' });
      if (line.includes('var ')) issues.push({ line: i + 1, issue: 'Use const/let instead of var', severity: 'medium' });
      if (line.includes('eval(')) issues.push({ line: i + 1, issue: 'Dangerous eval() usage', severity: 'critical' });
      if (line.includes('innerHTML')) issues.push({ line: i + 1, issue: 'Potential XSS via innerHTML', severity: 'high' });
      if (line.length > 120) issues.push({ line: i + 1, issue: 'Line exceeds 120 characters', severity: 'info' });
    });

    if (lines.length > 300) suggestions.push('Consider splitting this file into smaller modules');
    suggestions.push('Add JSDoc comments for public functions');
    suggestions.push('Consider adding error handling for edge cases');

    res.json({
      success: true,
      source: 'rule-based',
      review: {
        summary: `Analyzed ${file.name} (${lines.length} lines, ${file.language})`,
        issues,
        suggestions,
        improvedCode: null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate documentation with AI
// @route   POST /api/ai/:projectId/docs
exports.generateDocs = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const fileList = project.files.map(f => f.path).join('\n');
    const packageJson = project.files.find(f => f.name === 'package.json');
    let pkgInfo = {};
    if (packageJson && packageJson.content) {
      try { pkgInfo = JSON.parse(packageJson.content); } catch (e) {}
    }

    const readme = `# ${project.name}

${project.description || 'A web application project.'}

## Project Type
${project.type}

## Tech Stack
${pkgInfo.dependencies ? Object.keys(pkgInfo.dependencies).join(', ') : 'HTML, CSS, JavaScript'}

## Project Structure
\`\`\`
${fileList}
\`\`\`

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

## Quality Scores
| Metric | Score |
|--------|-------|
| Overall | ${project.scores.overall}/100 |
| Performance | ${project.scores.performance}/100 |
| Accessibility | ${project.scores.accessibility}/100 |
| SEO | ${project.scores.seo}/100 |
| Security | ${project.scores.security}/100 |
| Code Quality | ${project.scores.codeQuality}/100 |

## Analysis Summary
- Total Issues: ${project.analysis?.totalBugs || 0}
- Critical Issues: ${project.analysis?.criticalBugs || 0}
- Fixed Issues: ${project.analysis?.fixedBugs || 0}

---
*Generated by BugFinder - AI-Powered Website Analysis Platform*
`;

    res.json({
      success: true,
      documentation: {
        readme,
        projectStructure: fileList,
        packageInfo: pkgInfo
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
