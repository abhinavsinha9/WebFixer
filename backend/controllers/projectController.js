const Project = require('../models/Project');
const Bug = require('../models/Bug');
const User = require('../models/User');
const { Activity } = require('../models/Report');
const AdmZip = require('adm-zip');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Helper: detect project type from files
const detectProjectType = (files) => {
  const fileNames = files.map(f => f.name || f.path || '');
  if (fileNames.some(f => f === 'next.config.js' || f === 'next.config.mjs')) return 'nextjs';
  if (fileNames.some(f => f === 'vite.config.js' || f === 'vite.config.ts')) return 'react';
  if (fileNames.some(f => f === 'vue.config.js') || fileNames.some(f => f.endsWith('.vue'))) return 'vue';
  if (fileNames.some(f => f === 'package.json')) {
    const pkg = files.find(f => (f.name || f.path) === 'package.json');
    if (pkg && pkg.content) {
      try {
        const parsed = JSON.parse(pkg.content);
        if (parsed.dependencies?.react) return 'react';
        if (parsed.dependencies?.vue) return 'vue';
        if (parsed.dependencies?.next) return 'nextjs';
        if (parsed.dependencies?.express || parsed.main) return 'node';
      } catch (e) {}
    }
    return 'node';
  }
  if (fileNames.some(f => f.endsWith('.html'))) return 'html';
  return 'other';
};

// Helper: get language from extension
const getLanguage = (ext) => {
  const map = {
    '.js': 'javascript', '.jsx': 'javascript', '.ts': 'typescript', '.tsx': 'typescript',
    '.html': 'html', '.css': 'css', '.scss': 'scss', '.less': 'less',
    '.json': 'json', '.md': 'markdown', '.py': 'python', '.java': 'java',
    '.vue': 'vue', '.svelte': 'svelte', '.php': 'php', '.rb': 'ruby',
    '.xml': 'xml', '.yaml': 'yaml', '.yml': 'yaml', '.svg': 'xml',
    '.sh': 'shell', '.bat': 'batch', '.sql': 'sql'
  };
  return map[ext] || 'plaintext';
};

// @desc    Create project from ZIP upload
// @route   POST /api/projects/upload
exports.uploadProject = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a ZIP file' });
    }

    const { name, description } = req.body;
    const files = [];
    let totalSize = 0;

    // Extract ZIP
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();

    const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.less',
      '.json', '.md', '.txt', '.xml', '.yaml', '.yml', '.env', '.gitignore', '.svg',
      '.vue', '.svelte', '.php', '.py', '.rb', '.java', '.sh', '.bat', '.sql',
      '.mjs', '.cjs', '.map', '.lock'];

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      if (entry.entryName.includes('node_modules/')) continue;
      if (entry.entryName.includes('.git/')) continue;
      if (entry.entryName.startsWith('__MACOSX')) continue;

      const ext = path.extname(entry.entryName).toLowerCase();
      const isText = textExtensions.includes(ext);
      let content = '';

      if (isText && entry.header.size < 500000) {
        try { content = entry.getData().toString('utf8'); } catch (e) { content = ''; }
      }

      const fileObj = {
        path: entry.entryName,
        name: path.basename(entry.entryName),
        extension: ext,
        size: entry.header.size,
        content,
        language: getLanguage(ext)
      };

      files.push(fileObj);
      totalSize += entry.header.size;
    }

    // Create project
    const project = await Project.create({
      name: name || req.file.originalname.replace(/\.[^/.]+$/, ''),
      description: description || '',
      owner: req.user.id,
      source: 'upload',
      type: detectProjectType(files),
      status: 'ready',
      files,
      fileCount: files.length,
      totalSize
    });

    // Update user project count
    await User.findByIdAndUpdate(req.user.id, { $inc: { projectCount: 1 } });

    // Log activity
    try {
      await Activity.create({
        user: req.user.id,
        action: 'project-created',
        description: `Created project "${project.name}" via ZIP upload`,
        project: project._id
      });
    } catch (e) {}

    // Clean up uploaded file
    try { fs.unlinkSync(req.file.path); } catch (e) {}

    res.status(201).json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        slug: project.slug,
        type: project.type,
        source: project.source,
        status: project.status,
        fileCount: project.fileCount,
        totalSize: project.totalSize,
        createdAt: project.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create project from URL
// @route   POST /api/projects/url
exports.importFromUrl = async (req, res) => {
  try {
    const { url, name, description } = req.body;

    const files = [];
    let totalSize = 0;

    try {
      // Fetch the main page
      const response = await axios.get(url, {
        timeout: 30000,
        headers: { 'User-Agent': 'BugFinder/1.0' },
        maxContentLength: 10 * 1024 * 1024
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Store main HTML
      files.push({
        path: 'index.html',
        name: 'index.html',
        extension: '.html',
        size: Buffer.byteLength(html, 'utf8'),
        content: html,
        language: 'html'
      });
      totalSize += Buffer.byteLength(html, 'utf8');

      // Extract linked CSS
      const cssLinks = [];
      $('link[rel="stylesheet"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) cssLinks.push(href.startsWith('http') ? href : new URL(href, url).href);
      });

      // Extract inline styles
      $('style').each((i, el) => {
        const cssContent = $(el).html();
        if (cssContent) {
          files.push({
            path: `styles/inline-${i}.css`,
            name: `inline-${i}.css`,
            extension: '.css',
            size: Buffer.byteLength(cssContent, 'utf8'),
            content: cssContent,
            language: 'css'
          });
          totalSize += Buffer.byteLength(cssContent, 'utf8');
        }
      });

      // Fetch linked CSS files
      for (const cssUrl of cssLinks.slice(0, 10)) {
        try {
          const cssResponse = await axios.get(cssUrl, { timeout: 10000 });
          const cssName = path.basename(new URL(cssUrl).pathname) || 'style.css';
          files.push({
            path: `styles/${cssName}`,
            name: cssName,
            extension: '.css',
            size: Buffer.byteLength(cssResponse.data, 'utf8'),
            content: cssResponse.data,
            language: 'css'
          });
          totalSize += Buffer.byteLength(cssResponse.data, 'utf8');
        } catch (e) {}
      }

      // Extract script sources
      const scriptSrcs = [];
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.includes('google') && !src.includes('analytics') && !src.includes('facebook')) {
          scriptSrcs.push(src.startsWith('http') ? src : new URL(src, url).href);
        }
      });

      // Extract inline scripts
      $('script:not([src])').each((i, el) => {
        const jsContent = $(el).html();
        if (jsContent && jsContent.trim().length > 10) {
          files.push({
            path: `scripts/inline-${i}.js`,
            name: `inline-${i}.js`,
            extension: '.js',
            size: Buffer.byteLength(jsContent, 'utf8'),
            content: jsContent,
            language: 'javascript'
          });
          totalSize += Buffer.byteLength(jsContent, 'utf8');
        }
      });

      // Fetch script files
      for (const scriptUrl of scriptSrcs.slice(0, 10)) {
        try {
          const jsResponse = await axios.get(scriptUrl, { timeout: 10000 });
          const jsName = path.basename(new URL(scriptUrl).pathname) || 'script.js';
          files.push({
            path: `scripts/${jsName}`,
            name: jsName,
            extension: '.js',
            size: Buffer.byteLength(jsResponse.data, 'utf8'),
            content: typeof jsResponse.data === 'string' ? jsResponse.data : JSON.stringify(jsResponse.data),
            language: 'javascript'
          });
          totalSize += Buffer.byteLength(jsResponse.data, 'utf8');
        } catch (e) {}
      }

    } catch (fetchError) {
      // Even if fetch fails, create the project with the URL for later analysis
      files.push({
        path: 'index.html',
        name: 'index.html',
        extension: '.html',
        size: 0,
        content: `<!-- Failed to fetch: ${fetchError.message} -->`,
        language: 'html'
      });
    }

    const project = await Project.create({
      name: name || new URL(url).hostname,
      description: description || `Imported from ${url}`,
      owner: req.user.id,
      source: 'url',
      sourceUrl: url,
      type: 'website',
      status: 'ready',
      files,
      fileCount: files.length,
      totalSize
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { projectCount: 1 } });

    try {
      await Activity.create({
        user: req.user.id,
        action: 'project-created',
        description: `Imported project "${project.name}" from URL`,
        project: project._id
      });
    } catch (e) {}

    res.status(201).json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        slug: project.slug,
        type: project.type,
        source: project.source,
        sourceUrl: project.sourceUrl,
        status: project.status,
        fileCount: project.fileCount,
        totalSize: project.totalSize,
        createdAt: project.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create project from GitHub
// @route   POST /api/projects/github
exports.importFromGithub = async (req, res) => {
  try {
    const { repoUrl, name, description } = req.body;

    // Parse GitHub URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Invalid GitHub repository URL' });
    }

    const [, owner, repo] = match;
    const repoName = repo.replace('.git', '');

    const files = [];
    let totalSize = 0;

    try {
      // Fetch repo contents via GitHub API
      const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`;
      const headers = {};
      if (req.body.token) {
        headers.Authorization = `Bearer ${req.body.token}`;
      }

      let treeResponse;
      try {
        treeResponse = await axios.get(apiUrl, { headers, timeout: 30000 });
      } catch (e) {
        // Try 'master' branch if 'main' fails
        const masterUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/master?recursive=1`;
        treeResponse = await axios.get(masterUrl, { headers, timeout: 30000 });
      }

      const tree = treeResponse.data.tree || [];
      const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss',
        '.json', '.md', '.txt', '.xml', '.yaml', '.yml', '.vue', '.svelte', '.py', '.rb'];

      // Fetch file contents (limit to first 50 files for performance)
      const textFiles = tree
        .filter(item => item.type === 'blob' && !item.path.includes('node_modules/') && !item.path.includes('.git/'))
        .filter(item => textExtensions.includes(path.extname(item.path).toLowerCase()))
        .slice(0, 50);

      for (const item of textFiles) {
        try {
          const fileUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${item.path}`;
          const fileResponse = await axios.get(fileUrl, { headers, timeout: 10000 });

          let content = '';
          if (fileResponse.data.encoding === 'base64' && fileResponse.data.content) {
            content = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
          }

          const ext = path.extname(item.path).toLowerCase();
          files.push({
            path: item.path,
            name: path.basename(item.path),
            extension: ext,
            size: item.size || 0,
            content,
            language: getLanguage(ext)
          });
          totalSize += item.size || 0;
        } catch (e) {
          // Skip files that can't be fetched
          files.push({
            path: item.path,
            name: path.basename(item.path),
            extension: path.extname(item.path).toLowerCase(),
            size: item.size || 0,
            content: '',
            language: getLanguage(path.extname(item.path).toLowerCase())
          });
        }
      }

      // Add non-text files as references (no content)
      const otherFiles = tree
        .filter(item => item.type === 'blob' && !item.path.includes('node_modules/'))
        .filter(item => !textExtensions.includes(path.extname(item.path).toLowerCase()))
        .slice(0, 100);

      for (const item of otherFiles) {
        files.push({
          path: item.path,
          name: path.basename(item.path),
          extension: path.extname(item.path).toLowerCase(),
          size: item.size || 0,
          content: '',
          language: getLanguage(path.extname(item.path).toLowerCase())
        });
        totalSize += item.size || 0;
      }

    } catch (fetchError) {
      console.error('GitHub fetch error:', fetchError.message);
    }

    const project = await Project.create({
      name: name || repoName,
      description: description || `Imported from GitHub: ${owner}/${repoName}`,
      owner: req.user.id,
      source: 'github',
      sourceUrl: repoUrl,
      githubRepo: `${owner}/${repoName}`,
      type: detectProjectType(files),
      status: files.length > 0 ? 'ready' : 'error',
      files,
      fileCount: files.length,
      totalSize
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { projectCount: 1 } });

    try {
      await Activity.create({
        user: req.user.id,
        action: 'project-created',
        description: `Imported project "${project.name}" from GitHub`,
        project: project._id
      });
    } catch (e) {}

    res.status(201).json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        slug: project.slug,
        type: project.type,
        source: project.source,
        githubRepo: project.githubRepo,
        status: project.status,
        fileCount: project.fileCount,
        totalSize: project.totalSize,
        createdAt: project.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all projects for user
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, type, status, sort = '-createdAt' } = req.query;

    const query = { owner: req.user.id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .select('-files')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Get bug counts
    const bugCounts = await Bug.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const bugs = {};
    bugCounts.forEach(b => { bugs[b._id] = b.count; });

    res.json({
      success: true,
      project,
      bugSummary: bugs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const allowedFields = ['name', 'description', 'tags', 'settings'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).select('-files');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Delete associated bugs
    await Bug.deleteMany({ project: project._id });

    // Update user count
    await User.findByIdAndUpdate(req.user.id, { $inc: { projectCount: -1 } });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get project files (for code explorer)
// @route   GET /api/projects/:id/files
exports.getProjectFiles = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).select('files name');

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Build file tree
    const buildTree = (files) => {
      const tree = {};
      files.forEach(file => {
        const parts = file.path.split('/');
        let current = tree;
        parts.forEach((part, i) => {
          if (i === parts.length - 1) {
            current[part] = {
              type: 'file',
              name: file.name,
              path: file.path,
              extension: file.extension,
              size: file.size,
              language: file.language
            };
          } else {
            if (!current[part]) current[part] = { type: 'directory', children: {} };
            current = current[part].children;
          }
        });
      });
      return tree;
    };

    res.json({
      success: true,
      projectName: project.name,
      fileTree: buildTree(project.files),
      files: project.files.map(f => ({
        path: f.path,
        name: f.name,
        extension: f.extension,
        size: f.size,
        language: f.language
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get file content
// @route   GET /api/projects/:id/files/:filePath
exports.getFileContent = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const filePath = req.params[0] || req.query.path;
    const file = project.files.find(f => f.path === filePath);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/projects/stats/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [projectCount, projects, bugStats, recentActivity] = await Promise.all([
      Project.countDocuments({ owner: userId }),
      Project.find({ owner: userId }).select('scores analysis name slug type status createdAt').sort('-createdAt').limit(5),
      Bug.aggregate([
        { $lookup: { from: 'projects', localField: 'project', foreignField: '_id', as: 'proj' } },
        { $unwind: '$proj' },
        { $match: { 'proj.owner': req.user._id } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
        }}
      ]),
      Activity.find({ user: userId }).sort('-createdAt').limit(10).populate('project', 'name slug')
    ]);

    // Calculate average scores
    const avgScores = {
      performance: 0, accessibility: 0, seo: 0, security: 0, overall: 0
    };

    if (projects.length > 0) {
      const analyzedProjects = projects.filter(p => p.scores && p.scores.overall > 0);
      if (analyzedProjects.length > 0) {
        ['performance', 'accessibility', 'seo', 'security', 'overall'].forEach(key => {
          avgScores[key] = Math.round(
            analyzedProjects.reduce((sum, p) => sum + (p.scores[key] || 0), 0) / analyzedProjects.length
          );
        });
      }
    }

    const stats = bugStats[0] || { total: 0, critical: 0, open: 0, resolved: 0, closed: 0 };

    res.json({
      success: true,
      stats: {
        projects: projectCount,
        totalBugs: stats.total,
        criticalBugs: stats.critical,
        openBugs: stats.open,
        resolvedBugs: stats.resolved,
        closedBugs: stats.closed,
        scores: avgScores
      },
      recentProjects: projects,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
