const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    // In development without SMTP config, log emails to console
    return {
      sendMail: async (options) => {
        console.log('\n📧 EMAIL (Development Mode - Not Sent)');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text || 'HTML email');
        console.log('---\n');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'BugFinder'}" <${process.env.FROM_EMAIL || 'noreply@bugfinder.dev'}>`,
    to,
    subject,
    html,
    text
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email - BugFinder',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; font-size: 28px; margin: 0;">🔍 BugFinder</h1>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 40px; color: #e2e8f0;">
          <h2 style="color: #f8fafc; margin-top: 0;">Verify Your Email</h2>
          <p>Hi ${user.name},</p>
          <p>Welcome to BugFinder! Please verify your email address to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset Your Password - BugFinder',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; font-size: 28px; margin: 0;">🔍 BugFinder</h1>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 40px; color: #e2e8f0;">
          <h2 style="color: #f8fafc; margin-top: 0;">Reset Your Password</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
