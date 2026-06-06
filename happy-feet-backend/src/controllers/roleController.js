const Role = require('../models/Role');

/**
 * Get All Roles
 */
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create Role
 */
exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const existingRole = await Role.findOne({ name: name.trim() });
    if (existingRole) {
      return res.status(400).json({ success: false, message: 'Role already exists' });
    }

    const role = await Role.create({
      name: name.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Role
 */
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (existingRole.isSystemRole && name) {
      return res.status(400).json({
        success: false,
        message: 'System roles cannot have their name modified'
      });
    }

    if (name) {
      const duplicateRole = await Role.findOne({
        name: name.trim(),
        _id: { $ne: id }
      });
      if (duplicateRole) {
        return res.status(400).json({ success: false, message: 'Role name already exists' });
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(status && { status })
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Role
 */
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    if (role.isSystemRole) {
      return res.status(400).json({ success: false, message: 'System roles cannot be deleted' });
    }

    await role.deleteOne();
    return res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



