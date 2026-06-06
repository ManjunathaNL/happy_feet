const express = require('express');
const { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorizeRoute } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoute('read'), getCategories)  
  .post(authorizeRoute('create'), createCategory); 
router.route('/:id')
  .get(authorizeRoute('read'), getCategoryById) // GET /api/categories/:id
  .put(authorizeRoute('update'), updateCategory) 
  .delete(authorizeRoute('delete'), deleteCategory); 

module.exports = router;