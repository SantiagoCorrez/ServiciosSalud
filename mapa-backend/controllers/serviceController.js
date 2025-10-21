// controllers/serviceController.js
const Service = require('../models/Service');
const factory = require('./genericController');

exports.getAllServices = factory.getAll(Service);
exports.createService = factory.createOne(Service);
exports.getService = factory.getOne(Service);
exports.updateService = factory.updateOne(Service);
exports.deleteService = factory.deleteOne(Service);