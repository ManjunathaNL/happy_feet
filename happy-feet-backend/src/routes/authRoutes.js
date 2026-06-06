const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { login } = require('../controllers/authController');
const User = require('../models/User');
const Role = require('../models/Role');
const { sendPasswordResetEmail, sendCustomerWelcomeEmail } = require('../services/emailService');

// 1. Standard Login Matrix Endpoint
router.post('/login', login);

// 2. Customer Registration Pipeline
router.post('/register', async (req, res) => {
  const { name, email, mobile, password } = req.body;
  
  try {
    // Force lowercase and trim for validation consistency
    const cleanEmail = email.toLowerCase().trim();

    // Verify duplication indexes
    const accountExists = await User.findOne({ email: cleanEmail });
    if (accountExists) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // FIXED: Dynamically capture the template 'Customer' role schema reference
    const clientRole = await Role.findOne({ name: 'Customer' });
    if (!clientRole) {
      return res.status(500).json({ message: 'Default System Customer role profile is missing from database matrices.' });
    }

    // Split structural names safely
    const nameParts = name ? name.trim().split(' ') : ['User'];
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

    const deployedUser = await User.create({
      firstName,
      lastName,
      email: cleanEmail,
      mobile,
      password,
      roleId: clientRole._id, // Relinked cleanly
      status: 'active'
    });

    // Fire welcome onboarding email
    await sendCustomerWelcomeEmail(deployedUser.email, deployedUser.firstName);
    
    return res.status(201).json({ success: true, message: 'Account created successfully.' });
    
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 3. Forgot Password - Dynamic Token Allocation
// ==========================================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Secure fallback against account enumeration scanners
      return res.json({ success: true, message: 'If an account exists, a reset link was sent.' });
    }
    
    // 🔒 SECURE FIX: Create a highly dynamic, short-lived secret key unique to this current state
    const dynamicSecret = process.env.JWT_SECRET + user.password;

    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' }, 
      dynamicSecret, // Encrypted with current password hash state
      { expiresIn: '15m' }
    );

    await sendPasswordResetEmail(user.email, user.firstName, resetToken);

    return res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error processing password reset request.', error: error.message });
  }
});

// ==========================================
// 4. Reset Password - Parameter Decoding & Key Invalidation
// ==========================================
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // 1. Decode token payload first WITHOUT verification to find who the target user is
    const unverifiedDecoded = jwt.decode(token);
    if (!unverifiedDecoded || unverifiedDecoded.type !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid or malformed reset token payload.' });
    }

    const user = await User.findById(unverifiedDecoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User reference not found within indexing tables.' });
    }

    // 2. Re-create the dynamic secret key using this specific user's current password hash
    const dynamicSecret = process.env.JWT_SECRET + user.password;

    // 3. Now verify the token integrity against expiration and tampering
    try {
      jwt.verify(token, dynamicSecret);
    } catch (verifyError) {
      return res.status(400).json({ 
        message: 'This reset link has either already been used, is invalid, or has expired.' 
      });
    }

    // 4. Save unhashed plaintext password (the User model .pre('save') hook automatically applies salting/hashing)
    user.password = password;
    await user.save(); // ⚡ This line changes user.password, which completely invalidates the link for a 2nd attempt!

    return res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error processing reset request.', error: error.message });
  }
});

module.exports = router;