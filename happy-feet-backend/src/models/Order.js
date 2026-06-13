const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
    name: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: Object,
  paymentMethod: String,
  subtotal: Number,
  gstAmount: Number,
  shippingCost: Number,
  pointsRedemedCost: { type: Number, default: 0 },
  totalPaid: { type: Number, required: true },
  pointsEarnedFromPurchase: { type: Number, default: 0 },
  status: { type: String, default: "Placed" }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);