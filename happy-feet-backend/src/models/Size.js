const mongoose = require('mongoose');

const SizeSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true, trim: true }, // e.g., "UK-8"
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Size || mongoose.model('Size', SizeSchema);