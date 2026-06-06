const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('brandId').populate('categoryId');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brandId').populate('categoryId');
    if (!product) return res.status(404).json({ message: 'Footwear entry missing from logs' });
    
    // Auto-fetch child variant matrices tied to this product
    const variants = await ProductVariant.find({ productId: product._id });
    res.json({ product, variants });
  } catch (error) {
    res.status(400).json({ message: 'Query error processing product target' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Target update document reference missed' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Catalog allocation context dropped already' });
    
    // Clean up all related variations automatically to maintain data health
    await ProductVariant.deleteMany({ productId: req.params.id });
    res.json({ message: 'Product entity and nested variants dropped' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- MULTI-VARIANT OPERATIONS HANDLERS ---
exports.createVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.create(req.body);
    res.status(201).json(variant);
  } catch (error) { res.status(400).json({ message: error.message }); }
};