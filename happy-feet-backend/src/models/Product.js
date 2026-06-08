const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
 sku: { 
  type: String, 
  required: true, 
  unique: true, 
  uppercase: true, 
  trim: true,
  index: true 
},
  hsn: { type: String, default: "64041190", trim: true },

  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },

  // Dynamic Gender from Master Attributes
  gender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GlobalAttribute",
    required: true,
  },

  // Dynamic Dropdown Metadata
  season: { type: String, default: "Summer" },
  collectionYear: { type: String, default: "2026 Collection" },
  occasion: String,
  lifestyle: String,
  fitType: { type: String, default: "Regular" },
  closureType: String,
  toeShape: { type: String, default: "Round Toe" },

  // Content
  shortDescription: { type: String, required: true, trim: true },
  longDescription: { type: String, required: true, trim: true },
  features: { type: String },
  careInstructions: { type: String },

  // Financials
  costPrice: { type: Number, required: true, min: 0 },
  landingCost: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  discountPercentage: { type: Number, default: 0 },
  gstPercentage: { type: Number, default: 18 },

  images: [{ type: String }],

  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);