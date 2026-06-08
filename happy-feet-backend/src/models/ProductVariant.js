const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
 sku: { 
  type: String, 
  required: true, 
  unique: true, 
  uppercase: true, 
  trim: true,
  index: true 
},
  barcode: { type: String, unique: true },
  
  // Matrix structural points mapped to GlobalAttribute Object IDs
  colorId: { type: mongoose.Schema.Types.ObjectId, ref: 'GlobalAttribute', required: true },
  sizeId: { type: mongoose.Schema.Types.ObjectId, ref: 'GlobalAttribute', required: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'GlobalAttribute', required: true },
  
  // Individual Variant overrides
  costPrice: { type: Number, required: true },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  
  // Stock thresholds
  stockQuantity: { type: Number, required: true, default: 0 },
  minStock: { type: Number, default: 5 },
  maxStock: { type: Number, default: 100 }
}, { timestamps: true });

module.exports = mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema);