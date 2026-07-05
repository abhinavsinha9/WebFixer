const Project = require('../models/Project');
const Bug = require('../models/Bug');
const User = require('../models/User');
const { Notification, Activity } = require('../models/Report');
const AnalyzerService = require('../services/analyzerService');

// @desc    Run full analysis on a project
// @route   POST /api/analysis/:projectId
exports.runAnalysis = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Update status
    project.status = 'analyzing';
    await project.save();

    // Run analysis
    const analyzer = new AnalyzerService(project.files);
    const { bugs, scores } = analyzer.analyze();

    // Create bug records
    const bugDocs = [];
    for (const bug of bugs) {
      const bugDoc = await Bug.create({
        project: project._id,
        reportedBy: req.user.id,
        title: bug.title,
        description: bug.description,
        category: bug.category,
        severity: bug.severity,
        priority: bug.priority,
        affectedFile: bug.affectedFile,
        affectedLine: bug.affectedLine,
        codeSnippet: bug.codeSnippet,
        rootCause: bug.rootCause,
        suggestedFix: bug.suggestedFix,
        estimatedTime: bug.estimatedTime
      });
      bugDocs.push(bugDoc);
    }

    // Calculate bug stats
    const criticalBugs = bugs.filter(b => b.severity === 'critical').length;
    const warningBugs = bugs.filter(b => b.severity === 'high' || b.severity === 'medium').length;
    const infoBugs = bugs.filter(b => b.severity === 'low' || b.severity === 'info').length;

    // Update project
    project.scores = scores;
    project.status = 'analyzed';
    project.analysis = {
      lastAnalyzed: new Date(),
      totalBugs: bugs.length,
      criticalBugs,
      warningBugs,
      infoBugs,
      fixedBugs: 0
    };
    await project.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { bugsFound: bugs.length }
    });

    // Create notification
    try {
      await Notification.create({
        user: req.user.id,
        type: 'analysis-complete',
        title: 'Analysis Complete',
        message: `Analysis of "${project.name}" found ${bugs.length} issues. Score: ${scores.overall}/100`,
        link: `/projects/${project._id}`,
        project: project._id
      });

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${req.user.id}`).emit('analysis-complete', {
          projectId: project._id,
          projectName: project.name,
          totalBugs: bugs.length,
          scores
        });
      }
    } catch (e) {}

    // Log activity
    try {
      await Activity.create({
        user: req.user.id,
        action: 'analysis-completed',
        description: `Analysis of "${project.name}" completed. Found ${bugs.length} issues.`,
        project: project._id,
        metadata: { bugCount: bugs.length, scores }
      });
    } catch (e) {}

    res.json({
      success: true,
      analysis: {
        projectId: project._id,
        projectName: project.name,
        scores,
        totalBugs: bugs.length,
        criticalBugs,
        warningBugs,
        infoBugs,
        bugs: bugDocs.map(b => ({
          id: b._id,
          bugId: b.bugId,
          title: b.title,
          category: b.category,
          severity: b.severity,
          priority: b.priority,
          affectedFile: b.affectedFile,
          status: b.status
        }))
      }
    });
  } catch (error) {
    // Reset project status on error
    try {
      await Project.findByIdAndUpdate(req.params.projectId, { status: 'ready' });
    } catch (e) {}
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get analysis results for a project
// @route   GET /api/analysis/:projectId
exports.getAnalysisResults = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.id
    }).select('name slug scores analysis status type');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const bugs = await Bug.find({ project: project._id })
      .sort('-severity createdAt')
      .select('-comments -history');

    // Group bugs by category
    const categories = {};
    bugs.forEach(bug => {
      if (!categories[bug.category]) {
        categories[bug.category] = { count: 0, bugs: [] };
      }
      categories[bug.category].count++;
      categories[bug.category].bugs.push(bug);
    });

    // Group by severity
    const severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    bugs.forEach(bug => { severities[bug.severity]++; });

    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        scores: project.scores,
        analysis: project.analysis,
        status: project.status
      },
      summary: {
        total: bugs.length,
        severities,
        categories: Object.entries(categories).map(([name, data]) => ({
          name,
          count: data.count
        }))
      },
      bugs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get performance analysis
// @route   GET /api/analysis/:projectId/performance
exports.getPerformanceAnalysis = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const performanceBugs = await Bug.find({
      project: project._id,
      category: { $in: ['performance', 'large-image', 'large-bundle', 'slow-component', 'slow-api', 'render-blocking'] }
    });

    // Calculate detailed metrics
    const jsFiles = project.files.filter(f => ['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(f.extension));
    const cssFiles = project.files.filter(f => ['.css', '.scss', '.less'].includes(f.extension));
    const imageFiles = project.files.filter(f => ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(f.extension));

    const metrics = {
      score: project.scores.performance,
      jsSize: jsFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      cssSize: cssFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      imageSize: imageFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      totalSize: project.totalSize,
      fileCount: project.fileCount,
      jsFileCount: jsFiles.length,
      cssFileCount: cssFiles.length,
      imageFileCount: imageFiles.length,
      // Simulated Lighthouse-style metrics
      lcp: project.scores.performance > 80 ? '1.2s' : project.scores.performance > 50 ? '2.8s' : '4.5s',
      inp: project.scores.performance > 80 ? '50ms' : project.scores.performance > 50 ? '150ms' : '350ms',
      cls: project.scores.performance > 80 ? '0.05' : project.scores.performance > 50 ? '0.15' : '0.35',
      ttfb: project.scores.performance > 80 ? '200ms' : project.scores.performance > 50 ? '500ms' : '1200ms',
      fcp: project.scores.performance > 80 ? '0.8s' : project.scores.performance > 50 ? '2.0s' : '3.5s'
    };

    const recommendations = [];
    if (metrics.jsSize > 500000) recommendations.push('Implement code splitting to reduce JavaScript bundle size');
    if (metrics.imageSize > 1000000) recommendations.push('Optimize images using WebP/AVIF format and lazy loading');
    if (metrics.cssSize > 100000) recommendations.push('Remove unused CSS and consider CSS modules');
    if (performanceBugs.length > 0) recommendations.push('Address render-blocking resources');
    recommendations.push('Enable gzip/brotli compression on your server');
    recommendations.push('Implement browser caching with proper cache headers');

    res.json({
      success: true,
      performance: {
        metrics,
        issues: performanceBugs,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get accessibility analysis
// @route   GET /api/analysis/:projectId/accessibility
exports.getAccessibilityAnalysis = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const a11yBugs = await Bug.find({
      project: project._id,
      category: { $in: ['accessibility', 'missing-alt', 'missing-label', 'missing-aria', 'color-contrast'] }
    });

    const wcagChecks = {
      perceivable: {
        score: Math.max(0, 100 - a11yBugs.filter(b => ['missing-alt', 'color-contrast'].includes(b.category)).length * 10),
        issues: a11yBugs.filter(b => ['missing-alt', 'color-contrast'].includes(b.category)).length
      },
      operable: {
        score: Math.max(0, 100 - a11yBugs.filter(b => b.category === 'accessibility').length * 8),
        issues: a11yBugs.filter(b => b.category === 'accessibility').length
      },
      understandable: {
        score: Math.max(0, 100 - a11yBugs.filter(b => b.category === 'missing-label').length * 10),
        issues: a11yBugs.filter(b => b.category === 'missing-label').length
      },
      robust: {
        score: Math.max(0, 100 - a11yBugs.filter(b => b.category === 'missing-aria').length * 8),
        issues: a11yBugs.filter(b => b.category === 'missing-aria').length
      }
    };

    res.json({
      success: true,
      accessibility: {
        score: project.scores.accessibility,
        wcagChecks,
        issues: a11yBugs,
        totalIssues: a11yBugs.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get SEO analysis
// @route   GET /api/analysis/:projectId/seo
exports.getSEOAnalysis = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const seoBugs = await Bug.find({
      project: project._id,
      category: { $in: ['seo', 'missing-meta', 'broken-link'] }
    });

    res.json({
      success: true,
      seo: {
        score: project.scores.seo,
        issues: seoBugs,
        totalIssues: seoBugs.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get security analysis
// @route   GET /api/analysis/:projectId/security
exports.getSecurityAnalysis = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const secBugs = await Bug.find({
      project: project._id,
      category: 'security'
    });

    res.json({
      success: true,
      security: {
        score: project.scores.security,
        issues: secBugs,
        totalIssues: secBugs.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
