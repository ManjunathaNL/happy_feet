const nodemailer = require('nodemailer');

// Initialize the mail transport engine
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // Automatically true if using port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Note: Nodemailer expects 'pass', not 'password'
  },
});

// Brand Theme Constants for Email Client Compatibility
const BRAND_ACCENT = '#7f1d1d'; // Deep Red-900 Core Accent
const BRAND_CANVAS = '#f8fafc'; // Slate-50 Background
const TEXT_MAIN = '#334155';    // Slate-700 Text
const TEXT_MUTED = '#64748b';   // Slate-500 Text

const CLIENT_URL =
  process.env.CLIENT_URL?.replace(/\/$/, '') ||
  'http://localhost:5173';

exports.sendCustomerWelcomeEmail = async (userEmail, userName) => {
 const shopUrl = CLIENT_URL;

  const mailOptions = {
    from: `"Happy Feet" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Welcome to Happy Feet! 🎉',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; background-color: ${BRAND_CANVAS}; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; text-align: left;">
          
          <div style="background-color: ${BRAND_ACCENT}; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">HAPPY FEET</h1>
          </div>

          <div style="padding: 40px;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hi ${userName}, Welcome to Happy Feet!</h2>
            <p style="color: ${TEXT_MAIN}; line-height: 1.6; font-size: 15px;">
              Your account has been successfully created. You can now track your orders, save items to your wishlist, and experience a faster checkout.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${shopUrl}" style="background-color: ${BRAND_ACCENT}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">
                Start Shopping
              </a>
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 11px; color: ${TEXT_MUTED}; text-transform: uppercase; letter-spacing: 1px;">
              © ${new Date().getFullYear()} Happy Feet.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`🛒 Customer welcome email sent to: ${userEmail}`);
  } catch (error) {
    console.error('❌ Customer welcome email failed:', error.message);
  }
};

exports.sendOnboardingEmail = async (userEmail, userName, plainPassword, roleName) => {
 const loginUrl = CLIENT_URL;

  const mailOptions = {
    from: `"Happy Feet Enterprise" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Welcome to Happy Feet - Your Account is Ready',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; background-color: ${BRAND_CANVAS}; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; text-align: left;">
          
          <!-- Header Accent Bar -->
          <div style="background-color: ${BRAND_ACCENT}; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">HAPPY FEET</h1>
          </div>

          <!-- Email Body -->
          <div style="padding: 40px;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome to the team, ${userName}!</h2>
            <p style="color: ${TEXT_MAIN}; line-height: 1.6; font-size: 15px;">
              An administrative account has been provisioned for you on the Happy Feet management portal. Below are your secure access credentials.
            </p>
            
            <div style="background-color: ${BRAND_CANVAS}; padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid ${BRAND_ACCENT};">
              <p style="margin: 0 0 10px 0; color: ${TEXT_MAIN}; font-size: 14px;"><strong>Assigned Role:</strong> ${roleName}</p>
              <p style="margin: 0 0 10px 0; color: ${TEXT_MAIN}; font-size: 14px;"><strong>Username:</strong> ${userEmail}</p>
              <p style="margin: 0; color: ${TEXT_MAIN}; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 6px; font-weight: bold; color: #0f172a; letter-spacing: 1px;">${plainPassword}</code></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: ${BRAND_ACCENT}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">
                Access Dashboard
              </a>
            </div>

            <p style="font-size: 13px; color: ${TEXT_MUTED}; line-height: 1.5; margin-bottom: 0;">
              <strong>Security Notice:</strong> Please update your temporary password immediately upon your first successful login.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 11px; color: ${TEXT_MUTED}; text-transform: uppercase; letter-spacing: 1px;">
              © ${new Date().getFullYear()} Happy Feet Enterprise. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📦 Onboarding credentials email successfully sent to: ${userEmail}`);
  } catch (error) {
    console.error('❌ Onboarding email system transaction failed:', error.message);
  }
};

/**
 * Dispatches secure password recovery links to users who forgot their credentials.
 */
exports.sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
 const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Happy Feet Security" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Action Required: Password Reset Request',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; background-color: ${BRAND_CANVAS}; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; text-align: left;">
          
          <!-- Header Accent Bar -->
          <div style="background-color: ${BRAND_ACCENT}; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">HAPPY FEET</h1>
          </div>

          <!-- Email Body -->
          <div style="padding: 40px;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
            <p style="color: ${TEXT_MAIN}; line-height: 1.6; font-size: 15px;">
              Hi ${userName},<br><br>
              We received a request to reset the password associated with your account (<strong>${userEmail}</strong>). You can reset your password by clicking the secure link below.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" style="background-color: ${BRAND_ACCENT}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">
                Reset My Password
              </a>
            </div>

            <p style="font-size: 13px; color: ${TEXT_MUTED}; line-height: 1.5; margin-bottom: 0;">
              This link is securely generated and will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email. Your account remains secure.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 11px; color: ${TEXT_MUTED}; text-transform: uppercase; letter-spacing: 1px;">
              © ${new Date().getFullYear()} Happy Feet Security Module.
            </p>
          </div>

        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`🔐 Password reset email successfully sent to: ${userEmail}`);
  } catch (error) {
    console.error('❌ Password reset email transaction failed:', error.message);
  }
};