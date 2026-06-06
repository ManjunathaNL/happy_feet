const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  colorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true },
  sizeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Size', required: true },
  quantity: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

// Ensure strict unique tracking compound index per localized storage bucket variant location
InventorySchema.index({ storeId: 1, variantId: 1 }, { unique: true });

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);