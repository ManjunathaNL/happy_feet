const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const ProductVariant = require("../models/ProductVariant");
const authMiddleware = require("../middlewares/auth"); // Keep your existing token middleware path

// FETCH LOGGED IN USER BASKET NODES
router.get("/", authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId")
      .populate({
        path: "items.variantId",
        populate: [{ path: "colorId" }, { path: "sizeId" }]
      });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ADD NEW PAIR NODE OR INCREMENT QUANTITY
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const qtyInput = Number(quantity) || 1;

    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (!variant || variant.stockQuantity < qtyInput) {
        return res.status(400).json({ success: false, message: "Inventory threshold exceeded for selected size." });
      }
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const existingIndex = cart.items.findIndex(i => 
      i.productId.toString() === productId && 
      (!variantId || (i.variantId && i.variantId.toString() === variantId))
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qtyInput;
    } else {
      cart.items.push({ productId, variantId: variantId || null, quantity: qtyInput });
    }

    await cart.save();
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE EXISTING QUANTITY ARRAY COUNTS
router.put("/update-quantity", authMiddleware, async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const nextQty = Number(quantity);

    if (nextQty <= 0) return res.status(400).json({ success: false, message: "Invalid quantity bounds specified." });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart log absent." });

    const target = cart.items.find(i => 
      i.productId.toString() === productId && 
      (!variantId || (i.variantId && i.variantId.toString() === variantId))
    );

    if (!target) return res.status(404).json({ success: false, message: "Item entry not found." });

    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (variant && variant.stockQuantity < nextQty) {
        return res.status(400).json({ success: false, message: "Insufficient stock counts remaining." });
      }
    }

    target.quantity = nextQty;
    await cart.save();
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// REMOVE ENTRY COMPLETELY
router.delete("/remove", authMiddleware, async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart data target missing." });

    cart.items = cart.items.filter(i => 
      !(i.productId.toString() === productId && 
      (!variantId || (i.variantId && i.variantId.toString() === variantId)))
    );

    await cart.save();
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;