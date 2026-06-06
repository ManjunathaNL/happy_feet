const express = require('express');
const {
  getAllMappings,
  getRoutesByRole,
  assignRoutesToRole,
  removeMapping
} = require('../controllers/roleRouteMappingController');

const { protect, authorizeRoute } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoute('read'), getAllMappings)
  .post(authorizeRoute('create'), assignRoutesToRole);

router.route('/role/:roleId')
  .get(getRoutesByRole);

router.route('/:id')
  .delete(authorizeRoute('delete'), removeMapping);

module.exports = router;