// models/BedCount.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sede = require('./Sede');
const BedCount = sequelize.define('BedCount', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  initial_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  current_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  projected_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Las claves foráneas SedeId y BedTypeId serán añadidas automáticamente
  // por Sequelize al definir las relaciones.
}, {
  // Añadimos un índice único para evitar entradas duplicadas.
  // No puede haber dos registros para el mismo tipo de cama en la misma sede.
  indexes: [
    {
      unique: true,
      fields: ['SedeId', 'BedTypeId']
    }
  ]
});

Sede.hasMany(BedCount);
BedCount.belongsTo(Sede);
module.exports = BedCount;