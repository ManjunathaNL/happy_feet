const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const Role = require("./src/models/Role");
const User = require("./src/models/User");
const Route = require("./src/models/Route");
const RoleRouteMapping = require("./src/models/RoleRouteMapping");

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/roles", require("./src/routes/roleRoutes"));
app.use("/api/routes", require("./src/routes/routeRoutes"));
app.use("/api/brands", require("./src/routes/brandRoutes"));
app.use("/api/categories", require("./src/routes/categoryRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/inventory", require("./src/routes/inventoryRoutes"));
app.use("/api/role-route-mappings", require("./src/routes/roleRouteMappingRoutes"));

const seedDatabase = async () => {
  try {
    // 1. Setup Master Super Admin Profile
    let superAdminRole = await Role.findOne({ name: "Super Admin" });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: "Super Admin",
        description: "Master system root administration",
        isSystemRole: true,
        status: "active"
      });
      console.log("✅ 'Super Admin' role profile generated.");
    }

    // 2. Setup Customer Profile
    let customerRole = await Role.findOne({ name: "Customer" });
    if (!customerRole) {
      await Role.create({
        name: "Customer",
        description: "Standard platform buying storefront client",
        isSystemRole: true,
        status: "active"
      });
      console.log("✅ 'Customer' role profile generated.");
    }

    // 3. Setup Default Admin Account User
    let superAdminUser = await User.findOne({ email: "superadmin@happyfeet.com" });
    if (!superAdminUser) {
      await User.create({
        firstName: "Super",
        lastName: "Admin",
        email: "superadmin@happyfeet.com",
        mobile: "9876543210",
        password: "Admin@123",
        roleId: superAdminRole._id,
        status: "active",
      });
      console.log("✅ Master user created (superadmin@happyfeet.com).");
    }

    // 4. Clean Registry Matrix of Admin Panel Paths
    const coreAdminRoutes = [
      { path: "/dashboard", name: "Dashboard" },
      { path: "/users", name: "User Management" },
      { path: "/roles", name: "Role Management" },
      { path: "/routes", name: "Route Governance" },
      { path: "/role-route-mappings", name: "Access Mappings" },
      { path: "/brands", name: "Brand Management" },
      { path: "/categories", name: "Category Management" }
    ];

    console.log("Synchronizing admin panel paths into database repository...");
    for (const routeData of coreAdminRoutes) {
      let existingRoute = await Route.findOne({ path: routeData.path });
      if (!existingRoute) {
        existingRoute = await Route.create(routeData);
      }

      // Map permission profiles directly to Super Admin
      const existingMapping = await RoleRouteMapping.findOne({
        roleId: superAdminRole._id,
        routeId: existingRoute._id
      });

      if (!existingMapping) {
        await RoleRouteMapping.create({
          roleId: superAdminRole._id,
          routeId: existingRoute._id,
          permissions: { create: true, read: true, update: true, delete: true }
        });
      }
    }
    console.log("✅ Core system routes and permissions matrices configured clean!");

  } catch (error) {
    console.error("❌ System Seeding running exception:", error.message);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  seedDatabase();
  app.listen(PORT, () => 
    console.log(`Happy Feet Backend Engine running on port ${PORT}`)
  );
});