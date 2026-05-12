import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready');
  }
});

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Jivan Jodi" <noreply@jivanjodi.com>',
    to: email,
    subject: 'Verify Your Email - Jivan Jodi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Jivan Jodi!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for registering. Please verify your email address to complete registration.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy this link: <span style="color: #667eea;">${verificationUrl}</span></p>
            <p><strong>This link expires in 24 hours.</strong></p>
            <p>If you didn't create this account, ignore this email.</p>
            <p>Best regards,<br>Jivan Jodi Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jivan Jodi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send OTP for password reset
 */
export const sendPasswordResetOTP = async (email, name, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Jivan Jodi" <noreply@jivanjodi.com>',
    to: email,
    subject: 'Password Reset OTP - Jivan Jodi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>We received a request to reset your password. Use the OTP below to reset your password:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Enter this code on the password reset page</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, never share this OTP with anyone.</p>
            <p>Best regards,<br>Jivan Jodi Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jivan Jodi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

/**
 * Send password changed confirmation
 */
export const sendPasswordChangedEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Jivan Jodi" <noreply@jivanjodi.com>',
    to: email,
    subject: 'Password Changed Successfully - Jivan Jodi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <div class="success">
              ✅ Your password was successfully changed.
            </div>
            <p>If you didn't make this change, please contact us immediately at support@jivanjodi.com</p>
            <p>Best regards,<br>Jivan Jodi Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jivan Jodi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password changed confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

/**
 * Send account approval email
 */
export const sendApprovalEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Jivan Jodi" <noreply@jivanjodi.com>',
    to: email,
    subject: 'Account Approved - Jivan Jodi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Account Approved!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <div class="success">
              ✅ Congratulations! Your account has been approved by our team.
            </div>
            <p>You can now access all features of Jivan Jodi:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Browse potential matches</li>
              <li>Connect with other members</li>
            </ul>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login Now</a>
            </p>
            <p>We wish you the best in finding your perfect match!</p>
            <p>Best regards,<br>Jivan Jodi Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jivan Jodi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

/**
 * Send account rejection email
 */
export const sendRejectionEmail = async (email, name, reason) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Jivan Jodi" <noreply@jivanjodi.com>',
    to: email,
    subject: 'Account Application Update - Jivan Jodi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Application Update</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for your interest in Jivan Jodi.</p>
            <div class="warning">
              <strong>Application Status:</strong> Unfortunately, we are unable to approve your account at this time.
            </div>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you believe this is an error or would like to reapply, please contact our support team at support@jivanjodi.com</p>
            <p>Best regards,<br>Jivan Jodi Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jivan Jodi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
};

/**
 * Send pending approval notification (after email verification)
 */
export const sendPendingApprovalEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Jivan Jodi" <noreply@jivanjodi.com>',
    to: email,
    subject: 'Profile Under Review - Jivan Jodi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Profile Under Review</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for verifying your email address!</p>
            <div class="info-box">
              ℹ️ Your profile is currently under review by our admin team to ensure the safety and quality of our community.
            </div>
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team will review your profile within 24-48 hours</li>
              <li>You'll receive an email once your profile is approved</li>
              <li>After approval, you can login and start finding your perfect match</li>
            </ul>
            <p>We appreciate your patience and look forward to helping you find your life partner!</p>
            <p>Best regards,<br>Jivan Jodi Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jivan Jodi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Pending approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending pending approval email:', error);
    throw error;
  }
};

/**
 * Send report acknowledgment email
 */
export const sendReportAcknowledgmentEmail = async (email, reporterName, reportedUserName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Jivan Jodi" <noreply@jivanjodi.com>',
    to: email,
    subject: 'Report Received - Jivan Jodi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Report Received</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${reporterName}</strong>,</p>
            <div class="success">
              ✅ We have received your report about a user profile.
            </div>
            <p><strong>What we're doing:</strong></p>
            <ul>
              <li>Our safety team will review the reported profile</li>
              <li>We'll investigate the issue thoroughly</li>
              <li>Appropriate action will be taken to ensure user safety</li>
              <li>The reported profile will be hidden from your view</li>
            </ul>
            <div class="info-box">
              <strong>⚠️ Important:</strong> You will no longer see this profile in your matches or search results.
            </div>
            <p>Thank you for helping us maintain a safe and respectful community. Your vigilance helps protect all our members.</p>
            <p>If you have any additional information or concerns, please reply to this email.</p>
            <p>Best regards,<br>Jivan Jodi Safety Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jivan Jodi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Report acknowledgment email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending report acknowledgment email:', error);
    throw error;
  }
};

/**
 * Send inactivity warning email (for users inactive for 2 months)
 */
export const sendInactivityWarningEmail = async (email, name, daysUntilDeactivation = 7) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Jivan Jodi" <noreply@jivanjodi.com>',
    to: email,
    subject: 'We Miss You! Account Inactivity Notice - Jivan Jodi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💔 We Miss You!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>We noticed you haven't logged into your Jivan Jodi account in a while. We hope everything is okay!</p>
            <div class="warning">
              <strong>⚠️ Account Inactivity Notice:</strong> Your account has been inactive for 2 months and will be automatically deactivated in <strong>${daysUntilDeactivation} days</strong> if you don't log in.
            </div>
            <p><strong>To keep your account active:</strong></p>
            <ul>
              <li>Simply log in to your account</li>
              <li>Your account will remain active automatically</li>
              <li>You can reactivate it anytime by logging in</li>
            </ul>
            <p style="text-align: center;">
              <a href="${loginUrl}" class="button">Login to Keep Account Active</a>
            </p>
            <p><strong>Why we do this:</strong></p>
            <p>We deactivate inactive accounts to ensure our community remains active and engaged, giving all members the best chance of finding their perfect match.</p>
            <p>We'd love to see you back! Your perfect match might be waiting.</p>
            <p>Best regards,<br>Jivan Jodi Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jivan Jodi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Inactivity warning email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending inactivity warning email:', error);
    throw error;
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPendingApprovalEmail,
  sendReportAcknowledgmentEmail,
  sendInactivityWarningEmail,
};
