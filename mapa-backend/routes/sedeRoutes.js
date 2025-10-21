// routes/sedeRoutes.js
const express = require('express');
const router = express.Router();
const {
    createSede,
    getAllSedes,
    getSede,
    updateSede,
    deleteSede,
} = require('../controllers/sedeController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect, isAdmin);

router.route('/')
    .get(getAllSedes)
    .post(createSede);

router.route('/:id')
    .get(getSede)
    .put(updateSede)
    .delete(deleteSede);

module.exports = router;