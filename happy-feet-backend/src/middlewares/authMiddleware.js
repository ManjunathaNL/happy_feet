const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RoleRouteMapping = require('../models/RoleRouteMapping');
const Route = require('../models/Route');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).populate('roleId');
      
      if (!req.user || req.user.status === 'inactive') {
        return res.status(401).json({ message: 'User not authorized or account deactivated' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  }
  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

const authorizeRoute = (requiredAction) => {
  return async (req, res, next) => {
    try {
      const localizedPath = req.originalUrl.replace('/api', '').split('?')[0];

      const systemRoutes = await Route.find({});
      const targetRoute = systemRoutes.find(r => {
        if (r.path === '/' || r.path === '') {
          return localizedPath === '/' || localizedPath === '';
        }
        const ruleRegex = new RegExp(`^${r.path.replace(/:[^\s/]+/g, '[^/]+')}(/|$)`, 'i');
        return ruleRegex.test(localizedPath);
      });

      if (!targetRoute) {
        return res.status(404).json({ message: 'Route not registered in governance engine' });
      }

      if (req.user.roleId?.name === "Super Admin") {
        return next();
      }

      const mapping = await RoleRouteMapping.findOne({
        roleId: req.user.roleId._id,
        routeId: targetRoute._id
      });

      if (!mapping || !mapping.permissions[requiredAction]) {
        return res.status(403).json({ 
          message: `Access denied for ${requiredAction} on ${targetRoute.name}` 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization error', error: error.message });
    }
  };
};

module.exports = { protect, authorizeRoute };