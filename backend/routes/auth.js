const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin, validateForgotPassword, validateResetPassword, validateUpdateProfile } = require('../middleware/validation');
const {
  signup, login, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, verifyEmail, deleteAccount, updatePreferences
} = require('../controllers/authController');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/password', protect, changePassword);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:token', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.delete('/account', protect, deleteAccount);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
