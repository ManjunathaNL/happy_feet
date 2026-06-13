const express = require("express");
const router = express.Router();
const ProductVariant = require("../models/ProductVariant"); 
const InventoryLog = require("../models/InventoryLog");
const { protect } = require("../middlewares/authMiddleware"); // Ensure your RBAC checks validate admin statuses here

// 1. FETCH ALL VARIANT INVENTORY NODES (WITH METADATA)
router.get("/", protect, async (req, res) => {
  try {
    // Populate correctly based on your schema
    const variants = await ProductVariant.find()
      .populate({
        path: "productId",
        select: "name sku",
      })
      .populate("colorId", "name")
      .populate("sizeId", "name");

    // Debugging: Check if data is found
    console.log("Variants found in DB:", variants.length);

    return res.status(200).json({ success: true, data: variants });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. COMMIT AN INVENTORY BULK RESTOCK OVERRIDE OVER THE PIPELINE
router.put("/update-stock", protect, async (req, res) => {
  try {
    const { variantId, nextStockCount, adjustmentsReason } = req.body;
    const nextCount = Number(nextStockCount);

    if (isNaN(nextCount) || nextCount < 0) {
      return res.status(400).json({ success: false, message: "Inventory stock value must be a positive integer mapping." });
    }

    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Target product variation signature missing." });
    }

    const previousCount = variant.stockQuantity;
    const varianceDelta = nextCount - previousCount;

    // Skip creating logs if values are identical
    if (varianceDelta === 0) {
      return res.status(200).json({ success: true, message: "No stock variations logged." });
    }

    variant.stockQuantity = nextCount;
    await variant.save();

    // Log the transaction audit trail entry
    await InventoryLog.create({
      productId: variant.productId,
      variantId: variant._id,
      previousStock: previousCount,
      newStock: nextCount,
      delta: varianceDelta,
      reason: adjustmentsReason || "Manual Audit Modification",
      updatedBy: req.user.id
    });

    return res.status(200).json({
      success: true,
      message: "Inventory parameters synchronized accurately.",
      updatedStock: variant.stockQuantity
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;