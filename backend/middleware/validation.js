const { body, param, query, validationResult } = require('express-validator');

// Handle validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validations
const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[a-zA-Z]/).withMessage('Password must contain a letter'),
  handleValidation
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation
];

const validateForgotPassword = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  handleValidation
];

const validateResetPassword = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidation
];

const validateUpdateProfile = [
  body('name').optional().trim().isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  handleValidation
];

// Project validations
const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('source').isIn(['upload', 'github', 'gitlab', 'url', 'local'])
    .withMessage('Invalid project source'),
  handleValidation
];

const validateProjectUrl = [
  body('url').isURL().withMessage('Please provide a valid URL'),
  body('name').trim().notEmpty().withMessage('Project name is required'),
  handleValidation
];

// Bug validations
const validateBug = [
  body('title').trim().notEmpty().withMessage('Bug title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description').trim().notEmpty().withMessage('Bug description is required'),
  body('severity').optional().isIn(['critical', 'high', 'medium', 'low', 'info']),
  body('priority').optional().isIn(['urgent', 'high', 'medium', 'low']),
  handleValidation
];

const validateBugUpdate = [
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed', 'wont-fix']),
  body('severity').optional().isIn(['critical', 'high', 'medium', 'low', 'info']),
  body('priority').optional().isIn(['urgent', 'high', 'medium', 'low']),
  handleValidation
];

// ID validation
const validateObjectId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidation
];

module.exports = {
  handleValidation,
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateProject,
  validateProjectUrl,
  validateBug,
  validateBugUpdate,
  validateObjectId
};
