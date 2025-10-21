// models/SedeService.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sede = require('./Sede');
const Service = require('./Service');

const SedeService = sequelize.define('SedeService', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    initial_status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    current_status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    projected_status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

// Relaciones
Sede.belongsToMany(Service, { through: SedeService });
Service.belongsToMany(Sede, { through: SedeService });


module.exports = SedeService;