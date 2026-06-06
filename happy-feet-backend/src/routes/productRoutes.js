const express = require('express');
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct, createVariant } = require('../controllers/productController');
const { protect, authorizeRoute } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoute('read'), getProducts)     
  .post(authorizeRoute('create'), createProduct); 

router.route('/variants')
  .post(authorizeRoute('create'), createVariant); 

router.route('/:id')
  .get(authorizeRoute('read'), getProductById)  
  .put(authorizeRoute('update'), updateProduct)   
  .delete(authorizeRoute('delete'), deleteProduct); 

module.exports = router;