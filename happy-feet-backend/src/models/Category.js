const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, 
  parentDemographic: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], required: true }, 
  image: { type: String, required: true }, // Category thumbnail image
  status: { type: String, enum: ['active', 'inactive'], default: 'active' } 
}, { timestamps: true });

CategorySchema.index({ name: 1, parentDemographic: 1 }, { unique: true });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);