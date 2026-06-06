const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., "Black"
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Color || mongoose.model('Color', ColorSchema);