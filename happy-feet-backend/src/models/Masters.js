const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    mobile: String,
    email: String,
    address: String,
    area: String,
    city: String,
    pincode: String,
    status: { type: String, default: "Active", enum: ["Active", "Inactive"] },
  },
  { timestamps: true },
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    description: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

const subCategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

// Attribute Type Master
const attributeTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Add unique: true
    description: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

// Global Attribute (The specific values like 'Red', '8')
const globalAttributeSchema = new mongoose.Schema(
  {
    attributeTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttributeType",
      required: true,
    },
    name: { type: String, required: true },
    value: { type: String },
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

globalAttributeSchema.index({ attributeTypeId: 1, name: 1 }, { unique: true });

// Change this block to ensure the index is built properly
const GlobalAttribute = mongoose.model("GlobalAttribute", globalAttributeSchema);

// This ensures Mongoose waits for the index to be ready before accepting writes
GlobalAttribute.on('index', function(err) {
  if (err) {
    console.error("Index creation failed:", err);
  } else {
    console.log("GlobalAttribute unique index verified and ready.");
  }
});
const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    description: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    mobileImage: { type: String },
    priority: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

module.exports = {
  Store: mongoose.model("Store", storeSchema),
  Category: mongoose.model("Category", categorySchema),
  SubCategory: mongoose.model("SubCategory", subCategorySchema),
  AttributeType: mongoose.model("AttributeType", attributeTypeSchema),
  GlobalAttribute: mongoose.model("GlobalAttribute", globalAttributeSchema),
  Brand: mongoose.model("Brand", brandSchema),
  Banner: mongoose.model("Banner", bannerSchema),
};
