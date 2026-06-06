const mongoose = require('mongoose');

const RoleRouteMappingSchema = new mongoose.Schema({
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  permissions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Create a compound index to ensure a role-route pairing remains unique
RoleRouteMappingSchema.index({ roleId: 1, routeId: 1 }, { unique: true });

module.exports = mongoose.model('RoleRouteMapping', RoleRouteMappingSchema);