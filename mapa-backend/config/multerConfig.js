// config/multerConfig.js
const multer = require('multer');

// Configurar multer para almacenar archivos en memoria
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Aceptar solo archivos CSV
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido. Solo se aceptan archivos CSV.'), false);
    }
  },
});

module.exports = upload;