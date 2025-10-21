// scripts/list_bedtypes.js
// Improved script: test DB connection, show masked env diagnostics, and list bed types.
(async function(){
  try {
    const sequelize = require('../config/database');
    const BedType = require('../models/BedType');

    // Diagnostics (don't print the password itself)
    console.log('DB_NAME=', process.env.DB_NAME);
    console.log('DB_USER=', process.env.DB_USER);
    console.log('DB_HOST=', process.env.DB_HOST);
    console.log('DB_PORT=', process.env.DB_PORT);
    console.log('DB_PASSWORD set? ', typeof process.env.DB_PASSWORD !== 'undefined');
    console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection OK');

    const bedtypes = await BedType.findAll({ order: [['id','asc']] });
    for (const b of bedtypes) console.log(b.id, '|', b.name);
    process.exit(0);
  } catch (err) {
    console.error('Error testing DB connection or listing bed types:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
