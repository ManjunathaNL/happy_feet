const Inventory = require('../models/InventoryLog');

exports.adjustStock = async (req, res) => {
  const { variantId, storeCode, stockChange } = req.body;
  try {
    // Upsert balances: edit existing record or generate one instantly if first entry
    const record = await Inventory.findOneAndUpdate(
      { variantId, storeCode },
      { $inc: { stock: stockChange } }, // Dynamic mathematical balancing incrementation
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({}).populate({
      path: 'variantId',
      populate: { path: 'productId' }
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Inventory balances filtered specifically by unique variant id mapping arrays
exports.getInventoryByVariant = async (req, res) => {
  try {
    const records = await Inventory.find({ variantId: req.params.variantId });
    res.json(records);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};