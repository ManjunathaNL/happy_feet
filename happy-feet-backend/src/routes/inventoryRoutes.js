const express = require('express');
const { getInventory, adjustStock, getInventoryByVariant } = require('../controllers/inventoryController');
const { protect, authorizeRoute } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoute('read'), getInventory);  

router.route('/adjust')
  .post(authorizeRoute('update'), adjustStock);

router.route('/variant/:variantId')
  .get(authorizeRoute('read'), getInventoryByVariant); 

module.exports = router;