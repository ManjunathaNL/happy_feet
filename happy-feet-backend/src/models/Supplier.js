const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., "Nike Distributor"
  contactPerson: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  gstNumber: { type: String, required: true, uppercase: true, trim: true },
  address: { type: String, required: true },
  paymentTerms: { type: String, required: true }, // e.g., "Net 30", "COD"
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);