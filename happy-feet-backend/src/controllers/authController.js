// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const RoleRouteMapping = require("../models/RoleRouteMapping");
// const Route = require("../models/Route");

// exports.login = async (req, res) => {
//   const { email, password } = req.body;
  
//   // Guard clause against empty request bodies
//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password fields are required." });
//   }

//   const cleanEmail = email.toLowerCase().trim();

//   try {
//     // Locate the user using the sanitized cleanEmail string parameter
//     const user = await User.findOne({ email: cleanEmail }).populate("roleId");
    
//     if (!user || user.status === "inactive") {
//       return res.status(401).json({
//         message: "Invalid credentials or matching system profile is currently deactivated.",
//       });
//     }

//     // Verify cryptographic bcrypt hashes
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     const displayName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0];

//     let accessMatrix = [];

//     // Super Admin inherits full bypass clearances automatically
//     if (user.roleId?.name === "Super Admin") {
//       const allRoutes = await Route.find({ status: "active" });
//       accessMatrix = allRoutes.map(route => ({
//         path: route.path,
//         name: route.name,
//         permissions: { create: true, read: true, update: true, delete: true }
//       }));
//     } else {
//       // Extract mappings for Admin, Managers, and Custom corporate roles
//       const allowedMappings = await RoleRouteMapping.find({ roleId: user.roleId._id }).populate("routeId");
      
//       accessMatrix = allowedMappings
//         .filter((map) => map.routeId && map.routeId.status === "active")
//         .map((map) => ({
//           path: map.routeId.path,
//           name: map.routeId.name,
//           permissions: map.permissions,
//         }));
//     }

//     // Respond with a structured identity packet
//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: displayName,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.roleId?.name || "Customer",
//         profilePic: user.profilePhoto || "",
//       },
//       routes: accessMatrix,
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Authentication processor error", error: error.message });
//   }
// };


const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RoleRouteMapping = require("../models/RoleRouteMapping");
const Route = require("../models/Route");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  const cleanEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: cleanEmail }).populate("roleId");
    if (!user || user.status === "inactive") {
      return res.status(401).json({ message: "Invalid credentials or matching system profile is currently deactivated." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const displayName = user.fullName || `${user.firstName} ${user.lastName}`.trim();

    let accessMatrix = [];

    if (user.roleId?.name === "Super Admin") {
      const allRoutes = await Route.find({ status: "active" });
      accessMatrix = allRoutes.map(route => ({
        path: route.path,
        name: route.name,
        permissions: { create: true, read: true, update: true, delete: true }
      }));
    } else {
      const allowedMappings = await RoleRouteMapping.find({ roleId: user.roleId._id }).populate("routeId");
      accessMatrix = allowedMappings
        .filter((map) => map.routeId && map.routeId.status === "active")
        .map((map) => ({
          path: map.routeId.path,
          name: map.routeId.name,
          permissions: map.permissions,
        }));
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.roleId?.name || "Customer",
        profilePic: user.profilePhoto || "",
      },
      routes: accessMatrix,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
