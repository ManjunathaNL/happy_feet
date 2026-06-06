const express = require('express');
const { getBrands, createBrand, getBrandById, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, authorizeRoute } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect); // Secure entire sub-routing pipeline

router.route('/')
  .get(authorizeRoute('read'), getBrands)      
  .post(authorizeRoute('create'), createBrand); 

router.route('/:id')
  .get(authorizeRoute('read'), getBrandById)   // GET /api/brands/:id
  .put(authorizeRoute('update'), updateBrand)   
  .delete(authorizeRoute('delete'), deleteBrand); 

module.exports = router;