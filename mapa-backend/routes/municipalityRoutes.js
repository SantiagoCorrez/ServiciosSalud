// routes/municipalityRoutes.js
const express = require('express');
const router = express.Router();
const {
    createMunicipality,
    getAllMunicipalities,
    getMunicipality,
    updateMunicipality,
    deleteMunicipality,
} = require('../controllers/municipalityController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect, isAdmin)
router.route('/').get(getAllMunicipalities)
router.route('/').post(createMunicipality);

router.route('/:id')
    .get(getMunicipality)
    .put(updateMunicipality)
    .delete(deleteMunicipality);

module.exports = router;