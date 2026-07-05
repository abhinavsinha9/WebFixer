const Report = require('../models/Report');
const { Notification } = require('../models/Report');
const Project = require('../models/Project');
const Bug = require('../models/Bug');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'reports');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// @desc    Generate report
// @route   POST /api/reports/:projectId
exports.generateReport = async (req, res) => {
  try {
    const { type = 'full-audit', format = 'json' } = req.body;

    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user.id });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const bugs = await Bug.find({ project: project._id });

    const reportData = {
      summary: `${type} report for ${project.name}`,
      score: project.scores.overall,
      totalIssues: bugs.length,
      criticalIssues: bugs.filter(b => b.severity === 'critical').length,
      categories: {},
      recommendations: [],
      details: {
        scores: project.scores,
        analysis: project.analysis,
        bugs: bugs.map(b => ({
          bugId: b.bugId, title: b.title, severity: b.severity,
          category: b.category, status: b.status, affectedFile: b.affectedFile,
          suggestedFix: b.suggestedFix
        }))
      }
    };

    // Group by category
    bugs.forEach(b => {
      if (!reportData.categories[b.category]) reportData.categories[b.category] = 0;
      reportData.categories[b.category]++;
    });

    // Generate recommendations
    if (project.scores.performance < 80) reportData.recommendations.push('Optimize images and implement lazy loading');
    if (project.scores.accessibility < 80) reportData.recommendations.push('Add ARIA labels and fix heading hierarchy');
    if (project.scores.seo < 80) reportData.recommendations.push('Add meta tags and structured data');
    if (project.scores.security < 80) reportData.recommendations.push('Fix security vulnerabilities and remove hardcoded secrets');
    if (project.scores.codeQuality < 80) reportData.recommendations.push('Add ESLint, remove console statements, and refactor large functions');

    const report = await Report.create({
      project: project._id,
      generatedBy: req.user.id,
      title: `${type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${project.name}`,
      type,
      format,
      status: 'ready',
      data: reportData
    });

    // Create notification
    try {
      await Notification.create({
        user: req.user.id,
        type: 'report-ready',
        title: 'Report Ready',
        message: `Your ${type} report for "${project.name}" is ready to download.`,
        link: `/reports/${report._id}`,
        project: project._id
      });
    } catch (e) {}

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reports for a project
// @route   GET /api/reports/project/:projectId
exports.getProjectReports = async (req, res) => {
  try {
    const reports = await Report.find({ project: req.params.projectId })
      .populate('generatedBy', 'name')
      .sort('-createdAt');
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all user reports
// @route   GET /api/reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ generatedBy: req.user.id })
      .populate('project', 'name slug')
      .sort('-createdAt');
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('project', 'name slug scores analysis')
      .populate('generatedBy', 'name');
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export report as PDF
// @route   GET /api/reports/:id/export/pdf
exports.exportPDF = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('project', 'name scores');
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.pdf"`);

    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#3b82f6').text('BugFinder Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).fillColor('#1e293b').text(report.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#64748b').text(`Generated: ${new Date(report.createdAt).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Scores section
    doc.fontSize(16).fillColor('#1e293b').font('Helvetica-Bold').text('Scores Overview');
    doc.moveDown(0.5);

    if (report.project && report.project.scores) {
      const scores = report.project.scores;
      const scoreItems = [
        { label: 'Overall', value: scores.overall },
        { label: 'Performance', value: scores.performance },
        { label: 'Accessibility', value: scores.accessibility },
        { label: 'SEO', value: scores.seo },
        { label: 'Security', value: scores.security },
        { label: 'Code Quality', value: scores.codeQuality }
      ];

      scoreItems.forEach(item => {
        const color = item.value >= 80 ? '#10b981' : item.value >= 50 ? '#f59e0b' : '#ef4444';
        doc.fontSize(12).font('Helvetica').fillColor('#475569').text(`${item.label}: `, { continued: true });
        doc.font('Helvetica-Bold').fillColor(color).text(`${item.value}/100`);
      });
    }

    doc.moveDown(2);

    // Summary
    doc.fontSize(16).fillColor('#1e293b').font('Helvetica-Bold').text('Summary');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#475569');
    doc.text(`Total Issues: ${report.data.totalIssues}`);
    doc.text(`Critical Issues: ${report.data.criticalIssues}`);
    doc.moveDown();

    // Issues list
    if (report.data.details && report.data.details.bugs) {
      doc.fontSize(16).fillColor('#1e293b').font('Helvetica-Bold').text('Issues Found');
      doc.moveDown(0.5);

      report.data.details.bugs.slice(0, 30).forEach((bug, i) => {
        const sevColor = bug.severity === 'critical' ? '#ef4444' : bug.severity === 'high' ? '#f97316' : '#3b82f6';
        doc.fontSize(11).font('Helvetica-Bold').fillColor(sevColor)
          .text(`${i + 1}. [${bug.severity.toUpperCase()}] ${bug.title}`);
        if (bug.affectedFile) {
          doc.fontSize(9).font('Helvetica').fillColor('#94a3b8').text(`   File: ${bug.affectedFile}`);
        }
        if (bug.suggestedFix) {
          doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`   Fix: ${bug.suggestedFix}`);
        }
        doc.moveDown(0.3);

        if (doc.y > 700) {
          doc.addPage();
        }
      });
    }

    // Recommendations
    if (report.data.recommendations && report.data.recommendations.length > 0) {
      doc.addPage();
      doc.fontSize(16).fillColor('#1e293b').font('Helvetica-Bold').text('Recommendations');
      doc.moveDown(0.5);
      report.data.recommendations.forEach((rec, i) => {
        doc.fontSize(11).font('Helvetica').fillColor('#475569').text(`${i + 1}. ${rec}`);
        doc.moveDown(0.3);
      });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(9).fillColor('#94a3b8').text('Generated by BugFinder — AI-Powered Website Analysis Platform', { align: 'center' });

    doc.end();

    // Update download count
    await Report.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export report as CSV
// @route   GET /api/reports/:id/export/csv
exports.exportCSV = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

    const bugs = report.data.details?.bugs || [];
    const fields = ['bugId', 'title', 'severity', 'category', 'status', 'affectedFile', 'suggestedFix'];
    const parser = new Parser({ fields });
    const csv = parser.parse(bugs);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.csv"`);
    res.send(csv);

    await Report.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export report as Excel
// @route   GET /api/reports/:id/export/excel
exports.exportExcel = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BugFinder';

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 }
    ];
    summarySheet.addRow({ metric: 'Report Title', value: report.title });
    summarySheet.addRow({ metric: 'Total Issues', value: report.data.totalIssues });
    summarySheet.addRow({ metric: 'Critical Issues', value: report.data.criticalIssues });
    summarySheet.addRow({ metric: 'Overall Score', value: report.data.score });

    // Bugs sheet
    const bugsSheet = workbook.addWorksheet('Issues');
    bugsSheet.columns = [
      { header: 'ID', key: 'bugId', width: 20 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Severity', key: 'severity', width: 12 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'File', key: 'affectedFile', width: 30 },
      { header: 'Suggested Fix', key: 'suggestedFix', width: 50 }
    ];

    (report.data.details?.bugs || []).forEach(bug => {
      bugsSheet.addRow(bug);
    });

    // Style headers
    [summarySheet, bugsSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

    await Report.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, generatedBy: req.user.id });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
