const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  parentCategory: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], required: true }, 
  image: { type: String }, 
  banner: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' } 
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);