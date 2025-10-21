// scripts/fixMissingMunicipalities.js
// Usage: node scripts/fixMissingMunicipalities.js
// Attempts to find municipalities by flexible matching and assign their HealthRegionId

const sequelize = require('../config/database');
const Municipality = require('../models/Municipality');
const HealthRegion = require('../models/HealthRegion');

const targets = [
  { name: 'San Juan De Rioseco', desiredRegion: 'SABANA CENTRO OCCIDENTE' },
  { name: 'San Antonio De  Tequendama', desiredRegion: 'CENTRO' },
  { name: 'Ubaté', desiredRegion: 'NORORIENTE' }
];

function stripDiacritics(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function normalize(s) {
  if (!s) return '';
  return stripDiacritics(s).toUpperCase().replace(/\s+/g, ' ').trim();
}

async function run() {
  await sequelize.authenticate();
  console.log('Connected to DB');

  const municipalities = await Municipality.findAll();
  const regions = await HealthRegion.findAll();

  for (const t of targets) {
    const targetNorm = normalize(t.name);
    console.log('\nTarget:', t.name, '->', t.desiredRegion);

    // find region id for desiredRegion (case-insensitive)
    let region = regions.find(r => normalize(r.name) === normalize(t.desiredRegion));
    if (!region) {
      region = await HealthRegion.create({ name: t.desiredRegion.toUpperCase() });
      console.log('Created region', region.name);
    }

    // Matching strategies
    const exactMatches = municipalities.filter(m => normalize(m.name) === targetNorm);
    if (exactMatches.length === 1) {
      const m = exactMatches[0];
      await m.update({ HealthRegionId: region.id });
      console.log(`Assigned (exact) ${m.name} (id=${m.id}) -> ${region.name}`);
      continue;
    }

    // Try removing parenthetical content from DB names and target
    const targetNoPar = targetNorm.replace(/\s*\(.*\)\s*/g, '');
    const parMatches = municipalities.filter(m => normalize(m.name).replace(/\s*\(.*\)\s*/g, '') === targetNoPar);
    if (parMatches.length === 1) {
      const m = parMatches[0];
      await m.update({ HealthRegionId: region.id });
      console.log(`Assigned (parens) ${m.name} (id=${m.id}) -> ${region.name}`);
      continue;
    }

    // Try contains (all words present)
    const targetWords = targetNorm.split(' ').filter(Boolean);
    const containsMatches = municipalities.filter(m => {
      const mn = normalize(m.name);
      return targetWords.every(w => mn.includes(w));
    });
    if (containsMatches.length === 1) {
      const m = containsMatches[0];
      await m.update({ HealthRegionId: region.id });
      console.log(`Assigned (contains) ${m.name} (id=${m.id}) -> ${region.name}`);
      continue;
    }

    // If multiple candidates, print for manual selection
    if (exactMatches.length + parMatches.length + containsMatches.length > 1) {
      console.log('Multiple candidate matches found:');
      const candidates = Array.from(new Set([...exactMatches, ...parMatches, ...containsMatches]));
      for (const c of candidates) console.log(` - ${c.name} (id=${c.id})`);
      continue;
    }

    // Last resort: try ILIKE SQL by replacing spaces with %
    const likePattern = '%' + targetNorm.replace(/\s+/g, '%') + '%';
    const [rows] = await sequelize.query(`SELECT id, name FROM "${Municipality.getTableName()}" WHERE UPPER(name) LIKE :pat`, { replacements: { pat: likePattern } });
    if (rows.length === 1) {
      const row = rows[0];
      const m = await Municipality.findByPk(row.id);
      await m.update({ HealthRegionId: region.id });
      console.log(`Assigned (LIKE) ${m.name} (id=${m.id}) -> ${region.name}`);
      continue;
    }

    console.log('No unique match found. Candidates (up to 10):');
    const preview = (exactMatches.concat(parMatches).concat(containsMatches)).slice(0, 10);
    if (preview.length) preview.forEach(c => console.log(` - ${c.name} (id=${c.id})`));
    else console.log(' - (none)');
  }

  console.log('\nFinished');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
