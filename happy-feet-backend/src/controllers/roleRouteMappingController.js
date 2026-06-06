const RoleRouteMapping = require('../models/RoleRouteMapping');
const Role = require('../models/Role');
const Route = require('../models/Route');

// Get all mappings (for admin view)
exports.getAllMappings = async (req, res) => {
  try {
    const mappings = await RoleRouteMapping.find()
      .populate('roleId', 'name')
      .populate('routeId', 'name path');
    
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get routes for a specific role
exports.getRoutesByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const mappings = await RoleRouteMapping.find({ roleId })
      .populate('routeId');
    
    const routes = mappings.map(m => m.routeId);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign multiple routes to a role
exports.assignRoutesToRole = async (req, res) => {
  try {
    const { roleId, routeIds } = req.body;   // routeIds = array of route _id

    if (!roleId || !Array.isArray(routeIds)) {
      return res.status(400).json({ message: 'roleId and routeIds array are required' });
    }

    // Remove existing mappings for this role
    await RoleRouteMapping.deleteMany({ roleId });

    // Create new mappings
    const mappings = routeIds.map(routeId => ({
      roleId,
      routeId
    }));

    await RoleRouteMapping.insertMany(mappings);

    res.json({ message: 'Routes assigned successfully', count: mappings.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMapping = async (req, res) => {
  try {
    const { id } = req.params;
    await RoleRouteMapping.findByIdAndDelete(id);
    res.json({ message: 'Mapping removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};