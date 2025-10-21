// models/Sede.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Municipality = require('./Municipality');

const Sede = sequelize.define('Sede', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre de la sede, ej: HOSPITAL REGIONAL DE ZIPAQUIRÁ'
  },
  ese_name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre de la ESE a la que pertenece, ej: ESE HOSPITAL UNIVERSITARIO DE LA SAMARITANA'
  },
  reps_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'Código REPS del prestador'
  },
});

// Relación: Un Municipio puede tener muchas Sedes
Municipality.hasMany(Sede);
Sede.belongsTo(Municipality);

module.exports = Sede;