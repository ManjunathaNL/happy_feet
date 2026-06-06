const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  path: { type: String, required: true, unique: true },
  name: { type: String, required: true },               
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Route || mongoose.model('Route', RouteSchema);