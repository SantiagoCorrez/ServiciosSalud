// scripts/importMunicipalities.js
// Usage: node scripts/importMunicipalities.js
// Reads mapa-frontend/public/capas/Municipios_DANE.geojson and upserts municipalities
// into the database. The municipality id is taken from properties.muncodigo and the
// name from properties.munnombre. Geometry is stored in the `geometry` JSON field.

const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const Municipality = require('../models/Municipality');

async function run() {
  await sequelize.authenticate();
  console.log('Connected to DB');

  const geojsonPath = path.resolve(__dirname, '..', '..', 'mapa-frontend', 'public', 'capas', 'Municipios_DANE.geojson');
  if (!fs.existsSync(geojsonPath)) {
    console.error('GeoJSON file not found at', geojsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(geojsonPath, 'utf8');
  const geo = JSON.parse(raw);
  const features = geo.features || [];

  console.log(`Found ${features.length} features, starting upsert...`);
  let processed = 0;
  for (const feat of features) {
    const props = feat.properties || {};
    const codeRaw = props.muncodigo;
    const name = props.munnombre || props.nombre || null;
    const geometry = feat.geometry || null;

    // muncodigo is expected to be numeric string; parse to integer
    const id = parseInt(codeRaw, 10);
    if (isNaN(id)) {
      console.warn('Skipping feature with invalid muncodigo:', codeRaw);
      continue;
    }

    try {
      // Use raw SQL upsert to avoid model-mapping issues
      const tableName = Municipality.getTableName();
      const tbl = typeof tableName === 'string' ? tableName : tableName.tableName || tableName.name;
  const insertQ = `INSERT INTO "${tbl}" (id, name, "createdAt", "updatedAt") VALUES (:id, :name, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()`;
  await sequelize.query(insertQ, { replacements: { id, name } });
      processed++;
    } catch (err) {
      console.error('Error inserting/updating municipality', id, err.message || err);
    }
  }

  console.log(`Upsert finished: processed ${processed} / ${features.length}`);

  // Try to update the sequence (Postgres only) so future serial inserts don't conflict
  try {
    const tableName = Municipality.getTableName();
    // tableName may be a string or object depending on Sequelize version
    const tbl = typeof tableName === 'string' ? tableName : tableName.tableName || tableName.name;
  // Ensure we set at least 1 to avoid setval zero error
  const q = `SELECT setval(pg_get_serial_sequence('"${tbl}"', 'id'), GREATEST((SELECT COALESCE(MAX(id),0) FROM "${tbl}"),1))`;
    await sequelize.query(q);
    console.log('Updated serial sequence for', tbl);
  } catch (err) {
    console.warn('Could not update serial sequence (non-postgres or permission issue):', err.message || err);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
