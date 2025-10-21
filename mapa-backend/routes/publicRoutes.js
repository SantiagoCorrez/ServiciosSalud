// backend/routes/publicRoutes.js
const express = require('express');
const { getAllBedTypes } = require('../controllers/bedTypeController');
const { getAllMunicipalities } = require('../controllers/municipalityController');
const { getAllHealthRegions } = require('../controllers/healthRegionController');
const { getAllSedes } = require('../controllers/sedeController');
const { getAllServices } = require('../controllers/serviceController');
const publicController = require('../controllers/publicController');

const router = express.Router();

// Existing simple list endpoints
router.route('/bedTypes').get(getAllBedTypes);
router.route('/HeathRegions').get(getAllHealthRegions);
router.route('/Municipalities').get(getAllMunicipalities);
router.route('/Sedes').get(getAllSedes);
router.route('/Services').get(getAllServices);

// New public endpoints used by the frontend map
// Return municipalities as a GeoJSON FeatureCollection
router.route('/municipalities-geojson').get(publicController.getMunicipalitiesGeoJSON);

// Return details (beds and services) for a municipality by id
router.route('/details/:id').get(publicController.getMunicipalityDetails);

// Return sedes as GeoJSON FeatureCollection with optional filters
// Query params supported: healthRegionId, municipalityId, bedTypeId, serviceId
router.route('/sedes-geojson').get(publicController.getSedesGeoJSON);

module.exports = router;