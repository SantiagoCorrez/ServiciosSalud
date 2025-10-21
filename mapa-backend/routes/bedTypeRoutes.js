// routes/bedTypeRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllBedTypes,
    createBedType,
    getBedType,
    updateBedType,
    deleteBedType,
} = require('../controllers/bedTypeController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Proteger todas las rutas de este archivo con autenticación y rol de admin

router.route('/').get(getAllBedTypes)
router.use(protect, isAdmin);
router.route('/').post(createBedType);

router.route('/:id')
    .get(getBedType)
    .put(updateBedType)
    .delete(deleteBedType);

module.exports = router;