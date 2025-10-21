// models/BedType.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BedCount = require('./Bed');

const BedType = sequelize.define('BedType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Asegura que no haya tipos de cama duplicados
    comment: 'Ej: UCI Adulto, Cuidado Intermedio, Pediatría'
  },
});

BedType.hasMany(BedCount);
BedCount.belongsTo(BedType);
module.exports = BedType;