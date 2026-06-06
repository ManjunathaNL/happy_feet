const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
  variantSku: { type: String, required: true, unique: true }, 
  barcode: { type: String, unique: true }, 
  color: { type: String, required: true }, 
  size: { type: String, required: true }, 
  additionalPrice: { type: Number, default: 0 }, // If larger sizes cost more
  images: [{ type: String }] 
}, { timestamps: true });

module.exports = mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema);