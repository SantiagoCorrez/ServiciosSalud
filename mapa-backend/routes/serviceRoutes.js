// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllServices,
  createService,
  getService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Proteger todas las rutas de este archivo

router.route('/')
  .get(getAllServices);

router.use(protect, isAdmin);
router.route('/').post(createService);

router.route('/:id')
  .get(getService)
  .put(updateService)
  .delete(deleteService);

module.exports = router;