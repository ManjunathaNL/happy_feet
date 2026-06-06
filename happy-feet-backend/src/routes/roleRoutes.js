const express = require('express');
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roleController');

const { protect, authorizeRoute } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoute('read'), getRoles)
  .post(authorizeRoute('create'), createRole);

router.route('/:id')
  .put(authorizeRoute('update'), updateRole)
  .delete(authorizeRoute('delete'), deleteRole);

module.exports = router;