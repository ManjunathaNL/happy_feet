const express = require('express');
const { 
  getRoutes, 
  createRoute, 
  updateRoute, 
  deleteRoute, 
  getMyRoutes 
} = require('../controllers/routeController');

const { protect, authorizeRoute } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/my-routes').get(getMyRoutes);   // ← Used by sidebar

router.route('/')
  .get(authorizeRoute('read'), getRoutes)
  .post(authorizeRoute('create'), createRoute);

router.route('/:id')
  .put(authorizeRoute('update'), updateRoute)
  .delete(authorizeRoute('delete'), deleteRoute);

module.exports = router;