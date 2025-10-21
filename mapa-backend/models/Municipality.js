// models/Municipality.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const HealthRegion = require('./HealthRegion');

const Municipality = sequelize.define('Municipality', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // (geometry removed) boundaries/geojson are kept externally in the frontend capes
});

// Definimos la relación: Un Municipio pertenece a una Región de Salud
HealthRegion.hasMany(Municipality);

// Añadimos la relación inversa para facilitar los includes
Municipality.belongsTo(HealthRegion);


module.exports = Municipality;