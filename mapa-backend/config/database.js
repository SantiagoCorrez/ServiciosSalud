// config/database.js
const path = require('path');
const { Sequelize } = require('sequelize');
// Load .env located in the mapa-backend folder explicitly so scripts running from
// other current working directories still pick up the config.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    dialect: 'postgres',
    logging: false, // Puedes ponerlo en `true` para ver las consultas SQL
  }
);

module.exports = sequelize;