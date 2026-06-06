const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., "Whitefield"
  code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g., "HF-WHF01"
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mobile: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  address: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  openingDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Store || mongoose.model('Store', StoreSchema);