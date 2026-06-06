const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoute } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoute('read'), getUsers)    
  .post(authorizeRoute('create'), createUser); 

router.route('/:id')
  .put(authorizeRoute('update'), updateUser)     
  .delete(authorizeRoute('delete'), deleteUser); 

module.exports = router;