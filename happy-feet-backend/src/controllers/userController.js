const User = require('../models/User');
const Role = require('../models/Role');
const crypto = require('crypto');
const { sendOnboardingEmail } = require('../services/emailService');
exports.getUsers = async (req, res) => {
  try {
    // ✅ POPULATE: Include storeId name references
    const users = await User.find({}).populate('roleId').populate('storeId', 'name code').select('-password');
    res.json(users);
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

exports.createUser = async (req, res) => {
  // ✅ UNPACK: storeId included from req.body
  const { firstName, lastName, email, mobile, roleId, storeId, status, profilePhoto } = req.body;
  try {
    const accountExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (accountExists) {
      return res.status(400).json({ success: false, message: 'Email address already exists' });
    }

    const assignedRole = await Role.findById(roleId);
    if (!assignedRole) {
      return res.status(404).json({ message: 'Target role identifier could not be mapped.' });
    }

    const temporaryPlainPassword = crypto.randomBytes(6).toString('hex') + '@A1';

    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      mobile,
      password: temporaryPlainPassword,
      roleId: assignedRole._id,
      // ✅ ASSIGN: Save store link if provided
      storeId: assignedRole.name !== 'Customer' ? storeId || null : null, 
      status: status || 'active',
      profilePhoto: profilePhoto || ''
    });

    await sendOnboardingEmail(newUser.email, newUser.firstName, temporaryPlainPassword, assignedRole.name);

    res.status(201).json({
      success: true,
      message: 'Staff profile deployed cleanly. Onboarding dispatch complete.',
      user: {
        id: newUser._id,
        name: newUser.fullName,
        email: newUser.email,
        role: assignedRole.name
      }
    });

  } catch (error) { 
    res.status(400).json({ message: error.message }); 
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.body.password) delete req.body.password;
    
    // Clear out store data if the role is being changed to 'Customer'
    if (req.body.roleId) {
      const targetRole = await Role.findById(req.body.roleId);
      if (targetRole && targetRole.name === 'Customer') {
        req.body.storeId = null;
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('roleId')
      .populate('storeId', 'name code');
    res.json(user);
  } catch (error) { 
    res.status(400).json({ message: error.message }); 
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (userToDelete && userToDelete.email === 'superadmin@happyfeet.com') {
      return res.status(400).json({ message: 'System core master root administrative user cannot be deleted.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User record removed successfully' });
  } catch (error) { 
    res.status(400).json({ message: error.message }); 
  }
};