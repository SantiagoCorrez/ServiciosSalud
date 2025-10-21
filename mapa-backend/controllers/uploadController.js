// controllers/uploadController.js
const csv = require('csv-parser');
const { Readable } = require('stream');
const db = require('../config/database'); // Importa la instancia de sequelize
const HealthRegion = require('../models/HealthRegion');
const Municipality = require('../models/Municipality');
const Sede = require('../models/Sede');
const Service = require('../models/Service');
const BedType = require('../models/BedType');
const BedCount = require('../models/BedCount');
const SedeService = require('../models/SedeService');


// --- Procesador Principal del CSV ---
exports.uploadCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
        .pipe(csv({ separator: ';' })) // Asegúrate de que el separador sea el correcto
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            // Usamos una transacción para asegurar la integridad de los datos.
            // Si algo falla, se revierte toda la operación.
            const t = await db.transaction();

            try {
                for (const row of results) {
                    // --- Normalizar y Limpiar Datos ---
                    const municipalityName = row['municipio']?.trim().toUpperCase();
                    const sedeName = row['Sede']?.trim();
                    const repsCode = row['codigo REPS Prestador']?.trim();
                    const variableName = row['variables Camas - Servicios']?.trim();

                    if (!municipalityName || !sedeName || !variableName) continue; // Saltar filas vacías

                    // 1. Encontrar o crear el Municipio (asumimos que la Región de Salud se carga aparte)
                    const [municipality] = await Municipality.findOrCreate({
                        where: { name: municipalityName },
                        defaults: { name: municipalityName, HealthRegionId: 1 }, // Asigna un ID de región por defecto
                        transaction: t,
                    });

                    // 2. Encontrar o crear la Sede
                    const [sede] = await Sede.findOrCreate({
                        where: { reps_code: repsCode || `${sedeName}-${municipalityName}` },
                        defaults: {
                            name: sedeName,
                            ese_name: row['ESE Hospital']?.trim(),
                            reps_code: repsCode,
                            MunicipalityId: municipality.id,
                        },
                        transaction: t,
                    });

                    // 3. Diferenciar si la fila es un Servicio o un Tipo de Cama
                    //    (Esto es una suposición, debes ajustarla a la lógica de tu archivo)
                    const isBed = ['adultos', 'uci', 'pediatría', 'hospitalización'].some(keyword =>
                        variableName.toLowerCase().includes(keyword)
                    );

                    if (isBed) {
                        // --- Es un Tipo de Cama ---
                        const [bedType] = await BedType.findOrCreate({
                            where: { name: variableName },
                            transaction: t,
                        });

                        await BedCount.upsert({ // `upsert` actualiza si existe, o inserta si no.
                            initial_count: parseInt(row['inicial']) || 0,
                            current_count: parseInt(row['actual']) || 0,
                            projected_count: parseInt(row['proyectado']) || 0,
                            SedeId: sede.id,
                            BedTypeId: bedType.id,
                        }, { transaction: t });

                    } else {
                        // --- Es un Servicio ---
                        const [service] = await Service.findOrCreate({
                            where: { name: variableName },
                            transaction: t,
                        });

                        // Usamos la tabla intermedia SedeService
                        const [sedeService, created] = await SedeService.findOrCreate({
                            where: { SedeId: sede.id, ServiceId: service.id },
                            defaults: {
                                initial_status: parseInt(row['inicial']) || 0,
                                current_status: parseInt(row['actual']) || 0,
                                projected_status: parseInt(row['proyectado']) || 0,
                            },
                            transaction: t,
                        });

                        if (!created) { // Si ya existía, lo actualizamos
                            await sedeService.update({
                                initial_status: parseInt(row['inicial']) || 0,
                                current_status: parseInt(row['actual']) || 0,
                                projected_status: parseInt(row['proyectado']) || 0,
                            }, { transaction: t });
                        }
                    }
                }

                // Si todo el bucle se completó sin errores, confirmamos la transacción
                await t.commit();
                res.status(200).json({ msg: 'Archivo CSV procesado y base de datos actualizada con éxito.' });

            } catch (error) {
                // Si ocurrió algún error, revertimos todos los cambios
                await t.rollback();
                console.error("Error durante la transacción:", error);
                res.status(500).json({ msg: 'Error al procesar el archivo CSV.', error: error.message });
            }
        });
};