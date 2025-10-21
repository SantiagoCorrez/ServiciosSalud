// routes/healthRegionRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllHealthRegions,
  createHealthRegion,
  getHealthRegion,
  updateHealthRegion,
  deleteHealthRegion,
} = require('../controllers/healthRegionController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllHealthRegions);

router.use(protect, isAdmin)
router.route('/').post(createHealthRegion);

router.route('/:id')
    .get(getHealthRegion)
    .put(updateHealthRegion)
    .delete(deleteHealthRegion);

module.exports = router;