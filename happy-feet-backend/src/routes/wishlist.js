const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const authMiddleware = require("../middlewares/auth");

// GET ALL BOOKMARKED ENTRIES
router.get("/", authMiddleware, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate("products");
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
    }
    return res.status(200).json({ success: true, data: wishlist.products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// HEART FLIP TOGGLE REGISTRY LOGIC
router.post("/toggle", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) wishlist = await Wishlist.create({ userId: req.user.id, products: [] });

    const itemIndex = wishlist.products.indexOf(productId);
    let stateResult = "";

    if (itemIndex > -1) {
      wishlist.products.splice(itemIndex, 1);
      stateResult = "removed";
    } else {
      wishlist.products.push(productId);
      stateResult = "added";
    }

    await wishlist.save();
    return res.status(200).json({ success: true, action: stateResult, data: wishlist.products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;