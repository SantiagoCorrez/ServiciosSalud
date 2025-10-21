// controllers/municipalityController.js
const Municipality = require('../models/Municipality');
const HealthRegion = require('../models/HealthRegion');
const factory = require('./genericController');

// --- CREAR: Usamos el genérico, ya que el 'HealthRegionId' vendrá en el body ---
exports.createMunicipality = factory.createOne(Municipality);

// --- LEER TODOS: Función personalizada para incluir la relación ---
exports.getAllMunicipalities = async (req, res) => {
    try {
        const municipalities = await Municipality.findAll({
            include: [{
                model: HealthRegion,
                attributes: ['id', 'name'] // Solo incluimos los campos que necesitamos
            }]
        });
        res.status(200).json(municipalities);
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// --- Usamos la fábrica para el resto de operaciones ---
exports.getMunicipality = factory.getOne(Municipality);
exports.updateMunicipality = factory.updateOne(Municipality);
exports.deleteMunicipality = factory.deleteOne(Municipality);