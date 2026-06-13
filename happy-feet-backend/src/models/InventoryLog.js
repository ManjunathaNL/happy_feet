const mongoose = require("mongoose");

const InventoryLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  delta: { type: Number, required: true }, // Negative for sales deductions, positive for restocks
  reason: { type: String, default: "Manual Override" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("InventoryLog", InventoryLogSchema);