// controllers/publicController.js
const Municipality = require('../models/Municipality');
const Sede = require('../models/Sede');
const BedCount = require('../models/Bed');
const Service = require('../models/Service');
const SedeService = require('../models/SedeService');
const HealthRegion = require('../models/HealthRegion');
const BedType = require('../models/BedType');

// Helper: convert a municipality record to a GeoJSON Feature
function municipalityToFeature(m) {
    // Use stored geometry if present (assumed to be valid GeoJSON geometry object)
    return {
        type: 'Feature',
        geometry: m.geometry || null,
        properties: {
            id: m.id,
            name: m.name,
            healthRegion: m.HealthRegion ? { id: m.HealthRegion.id, name: m.HealthRegion.name } : null
        }
    };
}

// GET /public/municipalities-geojson
exports.getMunicipalitiesGeoJSON = async (req, res) => {
    try {
        const municipalities = await Municipality.findAll({
            include: [{ model: HealthRegion, attributes: ['id', 'name'] }]
        });

        const features = municipalities.map(municipalityToFeature);

        res.status(200).json({ type: 'FeatureCollection', features });
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// GET /public/details/:id
// Returns sedes for the municipality with their beds and services
exports.getMunicipalityDetails = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ msg: 'Invalid municipality id' });

    try {
        // Fetch municipality and include sedes with bed counts and services (through SedeService)
        const municipality = await Municipality.findByPk(id, {
            include: [
                {
                    model: Sede,
                    include: [
                        { model: BedCount },
                        { model: Service, through: { attributes: ['initial_status', 'current_status', 'projected_status'] } }
                    ]
                }
            ]
        });

        if (!municipality) return res.status(404).json({ msg: 'Municipality not found' });

        const format = (req.query.format || 'detailed').toLowerCase();

        // Build base data per sede
        const sedeData = (municipality.Sedes || []).map(sede => {
            const bedCounts = (sede.BedCounts || []).map(b => ({ id: b.id, BedTypeId: b.BedTypeId || null, initial_count: b.initial_count, current_count: b.current_count, projected_count: b.projected_count }));

            const services = (sede.Services || []).map(s => ({ id: s.id, name: s.name, initial_status: s.SedeService ? s.SedeService.initial_status : null, current_status: s.SedeService ? s.SedeService.current_status : null, projected_status: s.SedeService ? s.SedeService.projected_status : null }));

            return {
                id: sede.id,
                name: sede.name,
                address: sede.address || null,
                geometry: sede.geometry || null,
                bedCounts,
                services
            };
        });

        if (format === 'feature') {
            // Return sedes as a GeoJSON FeatureCollection
            const features = sedeData.map(s => ({ type: 'Feature', geometry: s.geometry || null, properties: { id: s.id, name: s.name, address: s.address, bedCounts: s.bedCounts, services: s.services } }));
            return res.status(200).json({ type: 'FeatureCollection', features });
        }

        if (format === 'aggregated') {
            // Aggregate bed counts across sedes
            const totals = { initial_count: 0, current_count: 0, projected_count: 0 };
            for (const s of sedeData) {
                for (const b of s.bedCounts) {
                    totals.initial_count += b.initial_count || 0;
                    totals.current_count += b.current_count || 0;
                    totals.projected_count += b.projected_count || 0;
                }
            }

            // Aggregate services: count how many sedes offer each service
            const serviceMap = new Map();
            for (const s of sedeData) {
                for (const svc of s.services) {
                    const key = svc.id;
                    const entry = serviceMap.get(key) || { id: svc.id, name: svc.name, sedeCount: 0 };
                    entry.sedeCount += 1;
                    serviceMap.set(key, entry);
                }
            }

            const servicesSummary = Array.from(serviceMap.values());

            return res.status(200).json({ municipalityId: municipality.id, municipalityName: municipality.name, totals, servicesSummary });
        }

        // Default: detailed
        return res.status(200).json({ municipalityId: municipality.id, municipalityName: municipality.name, sedes: sedeData });
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

module.exports = exports;

// GET /public/sedes-geojson
// Returns a FeatureCollection of sedes (points) with optional filters:
// healthRegionId, municipalityId, bedTypeId, serviceId
exports.getSedesGeoJSON = async (req, res) => {
    try {
        const { healthRegionId, municipalityId, bedTypeId, serviceId } = req.query;

        // Build include array and where conditions conditionally
        const include = [
            {
                model: Municipality,
                include: [{ model: HealthRegion, attributes: ['id', 'name'] }]
            },
            // include bed counts and their BedType if requested
            {
                model: BedCount,
                include: []
            },
            {
                model: Service,
                through: { attributes: ['initial_status', 'current_status', 'projected_status'] }
            }
        ];

        const where = {};

        // If municipalityId filter is present, use it to limit sedes
        if (municipalityId) {
            where.MunicipalityId = parseInt(municipalityId, 10);
        }

        // If healthRegionId is present, we need to filter via Municipality->HealthRegion
        const municipalityWhere = {};
        if (healthRegionId) {
            municipalityWhere.HealthRegionId = parseInt(healthRegionId, 10);
        }

        // If bedTypeId filter is present, we'll filter sedes that have a BedCount with that BedTypeId
        let havingBedType = null;
        if (bedTypeId) {
            havingBedType = parseInt(bedTypeId, 10);
        }

        // If serviceId filter is present, filter sedes that are associated to that service
        let havingServiceId = null;
        if (serviceId) {
            havingServiceId = parseInt(serviceId, 10);
        }

        // Fetch sedes with the built includes and where
        // We'll fetch broadly and then apply some JS-side filtering for joins that are easier to express here
        const sedes = await Sede.findAll({
            where,
            include
        });

        // Post-filtering for bedTypeId and serviceId
        const filtered = sedes.filter(sede => {
            // Municipality -> HealthRegion filter
            if (municipalityWhere.HealthRegionId) {
                if (!sede.Municipality || sede.Municipality.HealthRegionId !== municipalityWhere.HealthRegionId) return false;
            }

            if (havingBedType) {
                const hasBedType = (sede.BedCounts || []).some(b => b.BedTypeId === havingBedType);
                if (!hasBedType) return false;
            }

            if (havingServiceId) {
                const hasService = (sede.Services || []).some(s => s.id === havingServiceId);
                if (!hasService) return false;
            }

            return true;
        });

        // Map to GeoJSON Features
        const features = filtered.map(s => ({
            type: 'Feature',
            geometry: s.geometry || null,
            properties: {
                id: s.id,
                name: s.name,
                municipality: s.Municipality ? { id: s.Municipality.id, name: s.Municipality.name } : null,
                healthRegion: s.Municipality && s.Municipality.HealthRegion ? { id: s.Municipality.HealthRegion.id, name: s.Municipality.HealthRegion.name } : null,
                bedCounts: (s.BedCounts || []).map(b => ({ id: b.id, BedTypeId: b.BedTypeId, initial_count: b.initial_count, current_count: b.current_count, projected_count: b.projected_count })),
                services: (s.Services || []).map(svc => ({ id: svc.id, name: svc.name }))
            }
        }));

        return res.status(200).json({ type: 'FeatureCollection', features });
    } catch (error) {
        console.error('getSedesGeoJSON error', error);
        return res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};
