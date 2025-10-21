// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../config/multerConfig');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/upload/csv
// @desc    Subir y procesar archivo CSV de datos
// @access  Private/Admin
router.post(
  '/csv',
  [protect, isAdmin],   // 1. Proteger la ruta
  upload.single('file'), // 2. Usar multer para manejar un único archivo llamado 'file'
  uploadController.uploadCSV // 3. Ejecutar nuestro controlador
);

module.exports = router;