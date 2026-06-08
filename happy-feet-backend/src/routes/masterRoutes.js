const express = require("express");
const upload = require("../middlewares/upload");
const getModel = require("../models/Masters");

const router = express.Router();

// --- 1. ERROR HANDLER FOR MONGODB ---
// This translates ugly DB errors into friendly user messages
const handleDatabaseError = (err) => {
  if (err.code === 11000) {
    // Extracts the field name (e.g., 'code' or 'name') and the value ('HF-005')
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const friendlyName = field.charAt(0).toUpperCase() + field.slice(1);
    
    return `${friendlyName} "${value}" already exists. Please use a different one.`;
  }
  return err.message || "An unexpected system error occurred.";
};

// --- 2. DYNAMIC MODEL MIDDLEWARE ---
const getDynamicModel = (req, res, next) => {
  const moduleName = req.params.moduleName;

  const modelMap = {
    "stores": "Store",
    "brands": "Brand",
    "categories": "Category",
    "subcategories": "SubCategory",
    "attributetypes": "AttributeType",
    "globalattributes": "GlobalAttribute",
    "banners": "Banner"
  };

  const exactModelName = modelMap[moduleName];

  if (!exactModelName || !getModel[exactModelName]) {
    return res.status(404).json({ 
      message: `Invalid Master Module. '${moduleName}' does not exist.` 
    });
  }

  req.Model = getModel[exactModelName]; 
  next();
};


// ==========================================
// 3. THE UNIFIED ROUTE HANDLERS
// ==========================================

// GET ALL
router.get("/:moduleName", getDynamicModel, async (req, res) => {
  try {
    const data = await req.Model.find().sort({ createdAt: -1 });
    res.status(200).json({ data });
  } catch (err) { 
    res.status(500).json({ message: "Failed to fetch data." }); 
  }
});

// GET BY ID
router.get("/:moduleName/:id", getDynamicModel, async (req, res) => {
  try {
    const data = await req.Model.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Record not found" });
    res.status(200).json({ data });
  } catch (err) { 
    res.status(500).json({ message: "Failed to fetch record." }); 
  }
});

// CREATE
router.post("/:moduleName", upload.any(), getDynamicModel, async (req, res) => {
  try {
    const payload = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => { 
        payload[file.fieldname] = `/uploads/${file.filename}`; 
      });
    }
    
    const data = await req.Model.create(payload);
    res.status(201).json({ message: "Created successfully", data });
  } catch (err) { 
    // Uses our new error handler
    res.status(400).json({ message: handleDatabaseError(err) }); 
  }
});

// UPDATE
router.put("/:moduleName/:id", upload.any(), getDynamicModel, async (req, res) => {
  try {
    const payload = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => { 
        payload[file.fieldname] = `/uploads/${file.filename}`; 
      });
    }
    
    const data = await req.Model.findByIdAndUpdate(req.params.id, payload, { 
      new: true,
      runValidators: true // Forces Mongoose to validate data on update
    });
    
    res.status(200).json({ message: "Updated successfully", data });
  } catch (err) { 
    // Uses our new error handler
    res.status(400).json({ message: handleDatabaseError(err) }); 
  }
});

// DELETE
router.delete("/:moduleName/:id", getDynamicModel, async (req, res) => {
  try {
    await req.Model.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) { 
    res.status(500).json({ message: "Failed to delete record." }); 
  }
});

module.exports = router;