const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g., "Sneakers"
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

SubCategorySchema.index({ name: 1, categoryId: 1 }, { unique: true });

module.exports = mongoose.models.SubCategory || mongoose.model('SubCategory', SubCategorySchema);