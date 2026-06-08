


// // const express = require("express");
// // const upload = require("../middlewares/upload");
// // const Product = require("../models/Product");
// // const ProductVariant = require("../models/ProductVariant");
// // const router = express.Router();

// // const parseDatabaseError = (err) => {
// //   console.error("Full Error Object:", JSON.stringify(err, null, 2));

// //   if (err.code === 11000 || err.code === 11001) {
// //     let key = "unknown";
// //     let value = "unknown";

// //     if (err.keyValue) {
// //       key = Object.keys(err.keyValue)[0] || "field";
// //       value = err.keyValue[key];
// //     } else if (err.keyPattern) {
// //       key = Object.keys(err.keyPattern)[0] || "field";
// //     } else if (err.message.toLowerCase().includes("sku")) {
// //       key = "sku";
// //     }

// //     return `Duplicate entry on ${key} = "${value}". Try a different SKU.`;
// //   }

// //   if (err.name === 'ValidationError') {
// //     return Object.values(err.errors).map(e => e.message).join(', ');
// //   }

// //   return err.message || 'Server error';
// // };

// // // CREATE PRODUCT + VARIANTS
// // router.post("/", upload.array("images", 10), async (req, res) => {
// //   try {
// //     const { variants, ...productData } = req.body;
    
// //     // Save only filename or standard uniform relative route paths
// //     const imagePaths = req.files ? req.files.map(f => f.filename) : [];

// //     const cleanProduct = {
// //       ...productData,
// //       sku: (productData.sku || "").toUpperCase().trim(),
// //       images: imagePaths,
// //     };

// //     const product = await Product.create(cleanProduct);

// //     if (variants) {
// //       let variantArray = typeof variants === "string" ? JSON.parse(variants) : variants;

// //       if (Array.isArray(variantArray) && variantArray.length > 0) {
// //         const payloads = variantArray.map(v => ({
// //           productId: product._id,
// //           sku: (v.sku || "").toUpperCase().trim(),
// //           barcode: v.barcode || `BAR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
// //           colorId: v.colorId,
// //           sizeId: v.sizeId,
// //           materialId: v.materialId,
// //           costPrice: Number(v.costPrice),
// //           mrp: Number(v.mrp),
// //           sellingPrice: Number(v.sellingPrice),
// //           stockQuantity: Number(v.stockQuantity) || 0,
// //         }));

// //         await ProductVariant.insertMany(payloads);
// //       }
// //     }

// //     res.status(201).json({
// //       success: true,
// //       data: product,
// //       message: "Product and variants created successfully."
// //     });
// //   } catch (error) {
// //     console.error("Product creation error:", error);
// //     res.status(400).json({
// //       success: false,
// //       message: parseDatabaseError(error)
// //     });
// //   }
// // });

// // // GET ALL
// // router.get("/", async (req, res) => {
// //   try {
// //     const products = await Product.find({})
// //       .populate("brandId", "name logo")
// //       .populate("categoryId", "name")
// //       .populate("subCategoryId", "name")
// //       .populate("gender", "name")
// //       .sort({ createdAt: -1 });
// //     res.status(200).json({ success: true, data: products });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });

// // // GET BY ID
// // router.get("/:id", async (req, res) => {
// //   try {
// //     const product = await Product.findById(req.params.id)
// //       .populate("brandId", "name")
// //       .populate("categoryId", "name")
// //       .populate("subCategoryId", "name")
// //       .populate("gender", "name");

// //     if (!product) {
// //       return res.status(404).json({ success: false, message: "Product not found" });
// //     }

// //     const variants = await ProductVariant.find({ productId: product._id })
// //       .populate("colorId", "name value")
// //       .populate("sizeId", "name")
// //       .populate("materialId", "name");

// //     res.status(200).json({ success: true, data: { product, variants } });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // });

// // // UPDATE (Dynamic Image Management Integration)
// // router.put("/:id", upload.array("images", 10), async (req, res) => {
// //   try {
// //     const { variants, retainedImages, ...productData } = req.body;
// //     const newFiles = req.files ? req.files.map(f => f.filename) : [];

// //     const existing = await Product.findById(req.params.id);
// //     if (!existing) return res.status(404).json({ success: false, message: "Product not found" });

// //     // Parse existing images that the user kept in the UI
// //     const finalRetained = retainedImages ? JSON.parse(retainedImages) : [];
    
// //     // Combine retained images with newly uploaded ones
// //     const updatedImagesList = [...finalRetained, ...newFiles];

// //     const updateData = { 
// //       ...productData, 
// //       sku: productData.sku?.toUpperCase().trim(),
// //       images: updatedImagesList 
// //     };

// //     const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

// //     // Re-sync variants matrix
// //     await ProductVariant.deleteMany({ productId: req.params.id });
// //     if (variants) {
// //       const variantArray = typeof variants === "string" ? JSON.parse(variants) : variants;
// //       const cleanVariants = variantArray.map(v => ({
// //         ...v,
// //         productId: product._id,
// //         sku: (v.sku || "").toUpperCase().trim(),
// //       }));
// //       await ProductVariant.insertMany(cleanVariants);
// //     }

// //     res.status(200).json({ success: true, data: product });
// //   } catch (error) {
// //     res.status(400).json({ success: false, message: parseDatabaseError(error) });
// //   }
// // });

// // // DELETE
// // router.delete("/:id", async (req, res) => {
// //   try {
// //     await Product.findByIdAndDelete(req.params.id);
// //     await ProductVariant.deleteMany({ productId: req.params.id });
// //     res.status(200).json({ success: true, message: "Deleted" });
// //   } catch (error) {
// //     res.status(400).json({ success: false, message: error.message });
// //   }
// // });

// // module.exports = router;


// const express = require("express");
// const upload = require("../middlewares/upload");
// const Product = require("../models/Product");
// const ProductVariant = require("../models/ProductVariant");
// const router = express.Router();

// const parseDatabaseError = (err) => {
//   if (err.code === 11000 || err.code === 11001) {
//     let key = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
//     let value = err.keyValue ? err.keyValue[key] : "value";
//     return `Duplicate entry: ${key} = "${value}" already exists.`;
//   }
//   if (err.name === 'ValidationError') {
//     return Object.values(err.errors).map(e => e.message).join(', ');
//   }
//   return err.message || 'Server error';
// };

// // CREATE PRODUCT + VARIANTS
// router.post("/", upload.array("images", 10), async (req, res) => {
//   try {
//     const { variants, ...productData } = req.body;
    
//     // FIX: Save only relative filenames instead of absolute local operating system directory paths
//     const imagePaths = req.files ? req.files.map(f => `uploads/${f.filename}`) : [];

//     const cleanProduct = {
//       ...productData,
//       sku: (productData.sku || "").toUpperCase().trim(),
//       images: imagePaths,
//     };

//     const product = await Product.create(cleanProduct);

//     if (variants) {
//       let variantArray = typeof variants === "string" ? JSON.parse(variants) : variants;

//       if (Array.isArray(variantArray) && variantArray.length > 0) {
//         const payloads = variantArray.map(v => ({
//           productId: product._id,
//           sku: (v.sku || "").toUpperCase().trim(),
//           barcode: v.barcode || `BAR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
//           colorId: v.colorId,
//           sizeId: v.sizeId,
//           materialId: v.materialId,
//           costPrice: Number(v.costPrice),
//           mrp: Number(v.mrp),
//           sellingPrice: Number(v.sellingPrice),
//           stockQuantity: Number(v.stockQuantity) || 0,
//         }));

//         await ProductVariant.insertMany(payloads);
//       }
//     }

//     res.status(201).json({
//       success: true,
//       data: product,
//       message: "Product and variants created successfully."
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: parseDatabaseError(error) });
//   }
// });

// // GET ALL
// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.find({})
//       .populate("brandId", "name logo")
//       .populate("categoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("gender", "name")
//       .sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: products });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // GET BY ID (Product + Variants Combined Layout)
// router.get("/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate("brandId", "name")
//       .populate("categoryId", "name")
//       .populate("subCategoryId", "name")
//       .populate("gender", "name");

//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     const variants = await ProductVariant.find({ productId: product._id })
//       .populate("colorId", "name value")
//       .populate("sizeId", "name")
//       .populate("materialId", "name");

//     res.status(200).json({ success: true, data: { product, variants } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // UPDATE (Handles retaining/deleting specific files and updates variant lines)
// router.put("/:id", upload.array("images", 10), async (req, res) => {
//   try {
//     const { variants, retainedImages, ...productData } = req.body;
//     const newFiles = req.files ? req.files.map(f => `uploads/${f.filename}`) : [];

//     const existing = await Product.findById(req.params.id);
//     if (!existing) return res.status(404).json({ success: false, message: "Product not found" });

//     const finalRetained = retainedImages ? JSON.parse(retainedImages) : [];
//     const updatedImagesList = [...finalRetained, ...newFiles];

//     const updateData = { 
//       ...productData, 
//       sku: productData.sku?.toUpperCase().trim(),
//       images: updatedImagesList 
//     };

//     const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

//     // Wipe previous matrix definitions and rewrite active settings to avoid unique index duplicates
//     if (variants) {
//       await ProductVariant.deleteMany({ productId: req.params.id });
//       const variantArray = typeof variants === "string" ? JSON.parse(variants) : variants;
      
//       const cleanVariants = variantArray.map(v => ({
//         productId: product._id,
//         sku: (v.sku || "").toUpperCase().trim(),
//         barcode: v.barcode || `BAR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
//         colorId: v.colorId?._id || v.colorId,
//         sizeId: v.sizeId?._id || v.sizeId,
//         materialId: v.materialId?._id || v.materialId,
//         costPrice: Number(v.costPrice),
//         mrp: Number(v.mrp),
//         sellingPrice: Number(v.sellingPrice),
//         stockQuantity: Number(v.stockQuantity) || 0,
//       }));
//       await ProductVariant.insertMany(cleanVariants);
//     }

//     res.status(200).json({ success: true, data: product });
//   } catch (error) {
//     res.status(400).json({ success: false, message: parseDatabaseError(error) });
//   }
// });

// // DELETE
// router.delete("/:id", async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     await ProductVariant.deleteMany({ productId: req.params.id });
//     res.status(200).json({ success: true, message: "Deleted successfully" });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;


const express = require("express");
const upload = require("../middlewares/upload");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const router = express.Router();

const parseDatabaseError = (err) => {
  if (err.code === 11000 || err.code === 11001) {
    let key = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
    let value = err.keyValue ? err.keyValue[key] : "value";
    return `Duplicate entry: ${key} = "${value}" already exists.`;
  }
  return err.message || 'Server error';
};

// ==========================================
// 1. SPECIFIC / STATIC ROUTES (Must go first!)
// ==========================================

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("brandId", "name logo")
      .populate("categoryId", "name")
      .populate("subCategoryId", "name")
      .populate("gender", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET BINDINGS FOR SPECIFIC PRODUCT ID (Moved above dynamic /:id wildcard)
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
    res.status(200).json({ success: true, data: variants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. DYNAMIC PARAMETER ROUTES (Wildcards)
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

    res.status(200).json({ success: true, data: { product, variants } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE PRODUCT + VARIANTS MATRIX
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    const { variants, ...productData } = req.body;
    const imagePaths = req.files ? req.files.map(f => `uploads/${f.filename}`) : [];

    const cleanProduct = {
      ...productData,
      sku: (productData.sku || "").toUpperCase().trim(),
      images: imagePaths,
    };

    const product = await Product.create(cleanProduct);

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

    res.status(201).json({
      success: true,
      data: product,
      message: "Product and variants created successfully."
    });
  } catch (error) {
    res.status(400).json({ success: false, message: parseDatabaseError(error) });
  }
});

// UPDATE
router.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    const { variants, retainedImages, ...productData } = req.body;
    const newFiles = req.files ? req.files.map(f => `uploads/${f.filename}`) : [];

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Product not found" });

    const finalRetained = retainedImages ? JSON.parse(retainedImages) : [];
    const updatedImagesList = [...finalRetained, ...newFiles];

    const updateData = { 
      ...productData, 
      sku: productData.sku?.toUpperCase().trim(),
      images: updatedImagesList 
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

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

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: parseDatabaseError(error) });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    await ProductVariant.deleteMany({ productId: req.params.id });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;