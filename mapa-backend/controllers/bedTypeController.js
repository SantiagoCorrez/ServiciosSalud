// controllers/bedTypeController.js
const BedType = require('../models/BedType');
const factory = require('./genericController');

exports.getAllBedTypes = factory.getAll(BedType);
exports.createBedType = factory.createOne(BedType);
exports.getBedType = factory.getOne(BedType);
exports.updateBedType = factory.updateOne(BedType);
exports.deleteBedType = factory.deleteOne(BedType);