// const Route = require('../models/Route');
// const RoleRouteMapping = require('../models/RoleRouteMapping');

// // GET all routes
// exports.getRoutes = async (req, res) => {
//   try {
//     const routes = await Route.find({}).sort({ createdAt: -1 });
//     res.json(routes);
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//   }
// };

// // POST create route
// exports.createRoute = async (req, res) => {
//   try {
//     const { path, name } = req.body;
    
//     // Clean validation check matching your simplified schema parameters
//     if (!path || !name) {
//       return res.status(400).json({ message: 'Path and Name are required variables.' });
//     }

//     const existing = await Route.findOne({ path: path.trim() });
//     if (existing) {
//       return res.status(400).json({ message: 'This target route path is already registered.' });
//     }

//     const route = await Route.create({ 
//       path: path.trim(), 
//       name: name.trim() 
//     });
    
//     res.status(201).json(route);
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//   }
// };

// // PUT update route
// exports.updateRoute = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { path, name, status } = req.body;

//     const route = await Route.findById(id);
//     if (!route) return res.status(404).json({ message: 'Target route reference not found.' });

//     if (path && path !== route.path) {
//       const existing = await Route.findOne({ path: path.trim(), _id: { $ne: id } });
//       if (existing) return res.status(400).json({ message: 'Route path already exists' });
//     }

//     // Update only the operational schema keys
//     const updated = await Route.findByIdAndUpdate(
//       id, 
//       { 
//         ...(path && { path: path.trim() }), 
//         ...(name && { name: name.trim() }), 
//         ...(status && { status }) 
//       }, 
//       { new: true }
//     );
    
//     res.json(updated);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // DELETE route
// exports.deleteRoute = async (req, res) => {
//   try {
//     const route = await Route.findById(req.params.id);
//     if (!route) return res.status(404).json({ message: 'Route not found' });

//     if (route.path === '/dashboard') {
//       return res.status(400).json({ message: 'Core layout dashboard pathway cannot be deleted.' });
//     }

//     await route.deleteOne();
//     res.json({ message: 'Route deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // GET routes assigned to active user role
// exports.getMyRoutes = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user?.roleId) return res.status(403).json({ message: 'No role assigned' });

//     const mappings = await RoleRouteMapping.find({ roleId: user.roleId }).populate('routeId');

//     const routes = mappings
//       .filter(m => m.routeId?.status === 'active')
//       .map(m => m.routeId);

//     res.json(routes);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const Route = require('../models/Route');
const RoleRouteMapping = require('../models/RoleRouteMapping');
const Role = require('../models/Role');

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({}).sort({ createdAt: -1 });
    res.json(routes);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const { path, name } = req.body;
    if (!path || !name) {
      return res.status(400).json({ message: 'Both URL Path and Link Label Name parameters are required.' });
    }

    const cleanPath = '/' + path.replace(/^\//, '').trim();

    const existing = await Route.findOne({ path: cleanPath });
    if (existing) return res.status(400).json({ message: 'This destination route path already exists in registries.' });

    const route = await Route.create({ path: cleanPath, name: name.trim() });

    // ✨ FIXED AUTOMATION: Seamlessly map master clearances to Super Admin upon generation
    const superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (superAdminRole) {
      await RoleRouteMapping.create({
        roleId: superAdminRole._id,
        routeId: route._id,
        permissions: { create: true, read: true, update: true, delete: true }
      });
    }

    res.status(201).json(route);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { path, name, status } = req.body;

    const route = await Route.findById(id);
    if (!route) return res.status(404).json({ message: 'Route document reference could not be found.' });

    let cleanPath = route.path;
    if (path) {
      cleanPath = '/' + path.replace(/^\//, '').trim();
      if (cleanPath !== route.path) {
        const existing = await Route.findOne({ path: cleanPath, _id: { $ne: id } });
        if (existing) return res.status(400).json({ message: 'Target alternative URL path is already claimed.' });
      }
    }

    const updated = await Route.findByIdAndUpdate(
      id, 
      { 
        path: cleanPath, 
        ...(name && { name: name.trim() }), 
        ...(status && { status }) 
      }, 
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });

    if (route.path === '/dashboard') {
      return res.status(400).json({ message: 'Core route cannot be deleted' });
    }

    // Drop all existing structural route mapping blocks to maintain data sanitization integrity
    await RoleRouteMapping.deleteMany({ routeId: route._id });
    await route.deleteOne();
    
    res.json({ message: 'Route and all associated role mappings removed cleanly.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRoutes = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.roleId) return res.status(403).json({ message: 'No role assigned' });

    const mappings = await RoleRouteMapping.find({ roleId: user.roleId }).populate('routeId');

    const routes = mappings
      .filter(m => m.routeId?.status === 'active')
      .map(m => m.routeId);

    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};