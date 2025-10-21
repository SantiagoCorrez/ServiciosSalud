// models/HealthRegion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthRegion = sequelize.define('HealthRegion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = HealthRegion;