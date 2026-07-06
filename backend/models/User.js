const JsonModel = require('./jsonModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userMethods = {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  },
  generateToken(rememberMe = false) {
    return jwt.sign(
      { id: this._id, role: this.role },
      process.env.JWT_SECRET || 'default-secret-change-me',
      { expiresIn: rememberMe ? '30d' : (process.env.JWT_EXPIRE || '7d') }
    );
  },
  generateVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return token;
  },
  generateResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    this.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    return token;
  }
};

class UserModel extends JsonModel {
  constructor() {
    super('User', userMethods);
  }

  async create(data) {
    if (data.password) {
      const salt = await bcrypt.genSalt(12);
      data.password = await bcrypt.hash(data.password, salt);
    }
    
    // Set default values for schema
    data.role = data.role || 'developer';
    data.company = data.company || '';
    data.bio = data.bio || '';
    data.website = data.website || '';
    data.location = data.location || '';
    data.github = data.github || '';
    data.isEmailVerified = data.isEmailVerified || false;
    data.loginAttempts = data.loginAttempts || 0;
    data.projectCount = data.projectCount || 0;
    data.bugsFound = data.bugsFound || 0;
    data.bugsFixed = data.bugsFixed || 0;
    data.preferences = data.preferences || {
      theme: 'dark',
      language: 'en',
      notifications: { email: true, push: true, bugAlerts: true, reportReady: true }
    };
    data.apiKeys = data.apiKeys || [];

    return super.create(data);
  }
}

module.exports = new UserModel();
