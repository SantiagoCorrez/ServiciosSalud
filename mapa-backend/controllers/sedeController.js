// controllers/sedeController.js
const sequelize = require('../config/database');
const Sede = require('../models/Sede');
const Municipality = require('../models/Municipality');
const Service = require('../models/Service');
const SedeService = require('../models/SedeService');
const BedCount = require('../models/Bed');
const BedType = require('../models/BedType');
const factory = require('./genericController');

// --- CREAR: El 'MunicipalityId' debe venir en el req.body ---
// Custom createSede to include associated services and beds
exports.createSede = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const newSede = await Sede.create(req.body, { transaction: t });

        const services = await Service.findAll();
        const sedeServices = services.map(service => ({
            SedeId: newSede.id,
            ServiceId: service.id,
            initial_status: 0,
            current_status: 0,
            projected_status: 0
        }));
        await SedeService.bulkCreate(sedeServices, { transaction: t });

        const bedTypes = await BedType.findAll();
        const bedCounts = bedTypes.map(bedType => ({
            SedeId: newSede.id,
            BedTypeId: bedType.id,
            initial_count: 0,
            current_count: 0,
            projected_count: 0
        }));
        await BedCount.bulkCreate(bedCounts, { transaction: t });

        await t.commit();
        res.status(201).json(newSede);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ msg: 'Error al crear la sede', error: error.message });
    }
};

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

exports.getSedeData = async (req, res) => {
    try {
        const sedeId = req.params.id;
        const sede = await Sede.findByPk(sedeId, {
            include: [
                {
                    model: Service,
                    attributes: ['id', 'name'],
                    through: {
                        model: SedeService,
                        attributes: ['initial_status', 'current_status', 'projected_status']
                    }
                },
                {
                    model: BedCount,
                    attributes: ['id', 'initial_count', 'current_count', 'projected_count'],
                    include: [{
                        model: BedType,
                        attributes: ['id', 'name']
                    }]
                }
            ]
        });

        if (!sede) {
            return res.status(404).json({ msg: 'Sede not found' });
        }

        res.status(200).json(sede);
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

exports.updateSedeData = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const sedeId = req.params.id;
        const { Services, BedCounts } = req.body;

        // --- Update Services ---
        if (Services) {
            // First, delete existing services for this sede
            await SedeService.destroy({ where: { SedeId: sedeId }, transaction: t });

            // Then, create the new set of services
            const sedeServices = Services.map(service => ({
                SedeId: sedeId,
                ServiceId: service.id,
                initial_status: service.SedeService.initial_status,
                current_status: service.SedeService.current_status,
                projected_status: service.SedeService.projected_status
            }));
            await SedeService.bulkCreate(sedeServices, { transaction: t });
        }

        // --- Update BedCounts ---
        if (BedCounts) {
            // First, delete existing bed counts for this sede
            await BedCount.destroy({ where: { SedeId: sedeId }, transaction: t });

            // Then, create the new set of bed counts
            const bedCounts = BedCounts.map(bedCount => ({
                SedeId: sedeId,
                BedTypeId: bedCount.BedType.id,
                initial_count: bedCount.initial_count,
                current_count: bedCount.current_count,
                projected_count: bedCount.projected_count
            }));
            await BedCount.bulkCreate(bedCounts, { transaction: t });
        }

        await t.commit();
        res.status(200).json({ msg: 'Data updated successfully' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};
