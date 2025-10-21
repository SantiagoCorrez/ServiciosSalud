// controllers/sedeController.js
const Sede = require('../models/Sede');
const Municipality = require('../models/Municipality');
const factory = require('./genericController');

// --- CREAR: El 'MunicipalityId' debe venir en el req.body ---
exports.createSede = factory.createOne(Sede);

// --- LEER TODOS: Personalizado para incluir el Municipio ---
exports.getAllSedes = async (req, res) => {
    try {
        const sedes = await Sede.findAll({
            include: [{
                model: Municipality,
                attributes: ['id', 'name']
            }]
        });
        res.status(200).json(sedes);
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// --- Usamos la fábrica para el resto ---
exports.getSede = factory.getOne(Sede);
exports.updateSede = factory.updateOne(Sede);
exports.deleteSede = factory.deleteOne(Sede);