// controllers/healthRegionController.js
const HealthRegion = require('../models/HealthRegion');
const factory = require('./genericController');

exports.getAllHealthRegions = factory.getAll(HealthRegion);
exports.createHealthRegion = factory.createOne(HealthRegion);
exports.getHealthRegion = factory.getOne(HealthRegion);
exports.updateHealthRegion = factory.updateOne(HealthRegion);
exports.deleteHealthRegion = factory.deleteOne(HealthRegion);