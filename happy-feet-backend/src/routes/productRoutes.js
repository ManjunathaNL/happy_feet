const express = require("express");
const upload = require("../middlewares/upload");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const router = express.Router();

const sanitizePath = (p) => {
  if (!p) return "";
  const normalized = p.replace(/\\/g, "/"); // Convert Windows slashes
  if (normalized.includes("uploads/")) {
    return "uploads/" + normalized.split("uploads/")[1];
  }
  return normalized;
};
// ==========================================
// 1. SPECIFIC / STATIC ROUTES (Must go first!)
// ==========================================

// GET BINDINGS FOR SPECIFIC PRODUCT ID
// GET BINDINGS FOR SPECIFIC PRODUCT ID
router.get("/variants/query", async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID query parameter missing." });
    }
    const variants = await ProductVariant.find({ productId })
      .populate("colorId", "name value")
      .populate("sizeId", "name")
      .populate("materialId", "name");
    return res.status(200).json({ success: true, data: variants });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("brandId", "name logo")
      .populate("categoryId", "name")
      .populate("subCategoryId", "name")
      .populate("gender", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
// CREATE PRODUCT + VARIANTS MATRIX
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    const { variants, ...productData } = req.body;
    const imagePaths = req.files ? req.files.map(f => sanitizePath(`uploads/${f.filename}`)) : [];

    const product = await Product.create({
      ...productData,
      sku: (productData.sku || "").toUpperCase().trim(),
      images: imagePaths,
    });

    if (variants) {
      let variantArray = typeof variants === "string" ? JSON.parse(variants) : variants;
      if (Array.isArray(variantArray) && variantArray.length > 0) {
        const payloads = variantArray.map(v => ({
          productId: product._id,
          sku: (v.sku || "").toUpperCase().trim(),
          barcode: v.barcode || `BAR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          colorId: v.colorId,
          sizeId: v.sizeId,
          materialId: v.materialId,
          costPrice: Number(v.costPrice),
          mrp: Number(v.mrp),
          sellingPrice: Number(v.sellingPrice),
          stockQuantity: Number(v.stockQuantity) || 0,
        }));
        await ProductVariant.insertMany(payloads);
      }
    }
    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. DYNAMIC PARAMETER ROUTES (Wildcards placed at the absolute bottom!)
// ==========================================

// GET BY ID (Product Profile Matrix Layout)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("brandId", "name")
      .populate("categoryId", "name")
      .populate("subCategoryId", "name")
      .populate("gender", "name");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variants = await ProductVariant.find({ productId: product._id })
      .populate("colorId", "name value")
      .populate("sizeId", "name")
      .populate("materialId", "name");

    return res.status(200).json({ success: true, data: { product, variants } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE PRODUCT + VARIANTS MANAGEMENT HANDLER
// UPDATE
router.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    const { variants, retainedImages, ...productData } = req.body;
    const newFiles = req.files ? req.files.map(f => sanitizePath(`uploads/${f.filename}`)) : [];

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Product not found" });

    const rawRetained = retainedImages ? JSON.parse(retainedImages) : [];
    const finalRetained = rawRetained.map(img => sanitizePath(img));
    const updatedImagesList = [...finalRetained, ...newFiles];

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { ...productData, sku: productData.sku?.toUpperCase().trim(), images: updatedImagesList }, 
      { new: true }
    );

    if (variants) {
      await ProductVariant.deleteMany({ productId: req.params.id });
      const variantArray = typeof variants === "string" ? JSON.parse(variants) : variants;
      const cleanVariants = variantArray.map(v => ({
        productId: product._id,
        sku: (v.sku || "").toUpperCase().trim(),
        barcode: v.barcode || `BAR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        colorId: v.colorId?._id || v.colorId,
        sizeId: v.sizeId?._id || v.sizeId,
        materialId: v.materialId?._id || v.materialId,
        costPrice: Number(v.costPrice),
        mrp: Number(v.mrp),
        sellingPrice: Number(v.sellingPrice),
        stockQuantity: Number(v.stockQuantity) || 0,
      }));
      await ProductVariant.insertMany(cleanVariants);
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    await ProductVariant.deleteMany({ productId: req.params.id });
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;