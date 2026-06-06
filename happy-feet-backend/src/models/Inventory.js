const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true }, 
  storeCode: { type: String, required: true, default: 'MAIN_WAREHOUSE' },
  stock: { type: Number, required: true, default: 0 }, 
  lowStockThreshold: { type: Number, default: 5 }
}, { timestamps: true });

// Ensure a unique inventory record for each variant per branch location
InventorySchema.index({ variantId: 1, storeCode: 1 }, { unique: true });

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);