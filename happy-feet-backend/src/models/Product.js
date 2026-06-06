const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  sku: { type: String, required: true, unique: true }, 
  barcode: { type: String }, 
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  gender: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], required: true }, 
  description: { type: String }, 
  mrp: { type: Number, required: true }, 
  sellingPrice: { type: Number, required: true }, 
  costPrice: { type: Number, required: true }, 
  gstPercentage: { type: Number, default: 18 }, 
  status: { type: String, enum: ['active', 'inactive'], default: 'active' } 
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);