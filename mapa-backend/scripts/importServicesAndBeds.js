// scripts/importServicesAndBeds.js
// Usage: node scripts/importServicesAndBeds.js [--dry-run]
// Reads Servicios.csv and Camas.csv from repository root and upserts Sedes, Services, BedTypes, SedeService and BedCount records.

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Op } = require('sequelize');

const dryRun = process.argv.includes('--dry-run');
const doReport = process.argv.includes('--report');

const root = path.resolve(__dirname, '..', '..');
const serviciosPath = path.join(root, 'Servicios.csv');
const camasPath = path.join(root, 'Camas.csv');

// Models are exported individually in this project structure; require them directly
const Sede = require('../models/Sede');
const Service = require('../models/Service');
const SedeService = require('../models/SedeService');
const BedType = require('../models/BedType');
const BedCount = require('../models/Bed');
const Municipality = require('../models/Municipality');

function parseCSVLines(text) {
  // very small CSV parser tolerant of semicolon separator and lines with empty trailing fields
  return text.split(/\r?\n/).filter(Boolean).map(line => line.split(';').map(v => v.trim()));
}

async function ensureService(name) {
  if (!name) return null;
  if (dryRun) return { id: null, _virtual: true, name };
  const [svc, created] = await Service.findOrCreate({ where: { name }, defaults: { name } });
  return svc;
}

async function ensureBedType(name) {
  if (!name) return null;
  if (dryRun) return { id: null, _virtual: true, name };
  const [bt, created] = await BedType.findOrCreate({ where: { name }, defaults: { name } });
  return bt;
}

async function ensureSedeByName(name, reps_code, ese_name, municipalityId) {
  if (!name) return null;
  // try by reps_code first
  let sede = null;
  if (reps_code) sede = await Sede.findOne({ where: { reps_code } });
  if (!sede) sede = await Sede.findOne({ where: { name } });
  if (!sede) {
    if (dryRun) {
      console.log('[DRY] Create Sede', { name, reps_code, ese_name, municipalityId });
      return { id: null, _virtual: true, name };
    }
    sede = await Sede.create({ name, reps_code: reps_code || null, ese_name: ese_name || null, MunicipalityId: municipalityId || null });
    return sede;
  }
  // update reps_code/ese_name/municipality if needed
  const updates = {};
  if (reps_code && sede.reps_code !== reps_code) updates.reps_code = reps_code;
  if (ese_name && sede.ese_name !== ese_name) updates.ese_name = ese_name;
  if (municipalityId && sede.MunicipalityId !== municipalityId) updates.MunicipalityId = municipalityId;
  if (Object.keys(updates).length) {
    if (dryRun) console.log('[DRY] Update Sede', sede.id, updates);
    else await sede.update(updates);
  }
  return sede;
}

async function upsertSedeService(sede, service, counts) {
  if (!sede || !service) return;
  if (sede._virtual) {
    // nothing to persist in dry-run
    console.log('[DRY] Link Sede->Service', sede.name, '->', service.name, counts);
    return;
  }
  // If service is virtual (dry-run), avoid DB operations
  if (service._virtual) { console.log('[DRY] Link Sede->Service', sede.name, '->', service.name, counts); return; }

  const [link, created] = await SedeService.findOrCreate({
    where: { SedeId: sede.id, ServiceId: service.id },
    defaults: { SedeId: sede.id, ServiceId: service.id, initial_status: counts.initial || 0, current_status: counts.current || 0, projected_status: counts.projected || 0 }
  });
  if (!created) {
    // update numbers
    const updates = {};
    if (typeof counts.initial === 'number') updates.initial_status = counts.initial;
    if (typeof counts.current === 'number') updates.current_status = counts.current;
    if (typeof counts.projected === 'number') updates.projected_status = counts.projected;
    if (Object.keys(updates).length) await link.update(updates);
  }
}

async function upsertBedCount(sede, bedType, counts) {
  if (!sede || !bedType) return;
  if (sede._virtual) {
    console.log('[DRY] Create BedCount for', sede.name, bedType.name, counts);
    return;
  }
  if (bedType._virtual) { console.log('[DRY] Create BedCount for', sede.name, bedType.name, counts); return; }
  const [bc, created] = await BedCount.findOrCreate({
    where: { SedeId: sede.id, BedTypeId: bedType.id },
    defaults: { SedeId: sede.id, BedTypeId: bedType.id, initial_count: counts.initial || 0, current_count: counts.current || 0, projected_count: counts.projected || 0 }
  });
  if (!created) {
    const updates = {};
    if (typeof counts.initial === 'number') updates.initial_count = counts.initial;
    if (typeof counts.current === 'number') updates.current_count = counts.current;
    if (typeof counts.projected === 'number') updates.projected_count = counts.projected;
    if (Object.keys(updates).length) await bc.update(updates);
  }
}

function parseNumber(val) {
  if (!val) return null;
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? null : n;
}

(async function main(){
  console.log('Import script started. dryRun=', dryRun);
  const parsedServices = new Set();
  const parsedBedTypes = new Set();
  const parsedSedes = new Set();
  const missingMunicipalities = new Set();
  const actions = [];
  // Read servicios
  if (!fs.existsSync(serviciosPath)) {
    console.error('Servicios.csv not found at', serviciosPath);
    process.exit(1);
  }
  const serviciosText = fs.readFileSync(serviciosPath, 'utf8');
  const svcRows = parseCSVLines(serviciosText);
  // Expect header in first row; try to detect and remove if it matches expected header
  if (svcRows.length && svcRows[0][0] && svcRows[0][0].toLowerCase().includes('ese')) svcRows.shift();

  // Process each row: columns: ESE Hospital;codigo REPS Prestador;Sede;codigo Municipio;municipio;variables Camas - Servicios;inicial;actual;proyectado
  for (const row of svcRows) {
    const [eseName, repsCode, sedeName, municipioCodigo, municipioNombre, variableName, inicial, actual, proyectado] = row;
    const municipalityId = municipioCodigo ? parseInt(municipioCodigo, 10) : null;
    let municipality = null;
    if (municipalityId) municipality = await Municipality.findByPk(municipalityId);

    const serviceName = (variableName || '').trim();
    const counts = { initial: parseNumber(inicial), current: parseNumber(actual), projected: parseNumber(proyectado) };

    if (!serviceName) continue;
    parsedServices.add(serviceName);
  actions.push({ operation: 'sedeService', eseName, repsCode, sedeName, municipalityCodigo: municipioCodigo, municipalityId, serviceName, counts });
    const svc = await ensureService(serviceName);
    const sede = await ensureSedeByName(sedeName || eseName, repsCode, eseName, municipality ? municipality.id : null);
    parsedSedes.add((sedeName || eseName || '').trim());
    if (municipalityId && !municipality) missingMunicipalities.add(municipalityId);
    await upsertSedeService(sede, svc, counts);
  }

  // Now process camas file if present
  if (!fs.existsSync(camasPath)) {
    console.log('Camas.csv not found at', camasPath, '- skipping bed counts import');
  } else {
    const camasText = fs.readFileSync(camasPath, 'utf8');
    const bedRows = parseCSVLines(camasText);
    // If header line exists detect/remove
    if (bedRows.length && bedRows[0][0] && bedRows[0][0].toLowerCase().includes('sede')) bedRows.shift();
    // Expected columns might be similar to Servicios.csv, we'll parse flexibly
    for (const row of bedRows) {
      // try to find municipality code and bed type name and counts
      // We'll search for the first numeric 5-digit token as municipio code
      let municipioCodigo = null;
      for (const col of row) {
        if (/^\d{5}$/.test(col)) { municipioCodigo = col; break; }
      }
      const municipalityId = municipioCodigo ? parseInt(municipioCodigo, 10) : null;
      const municipality = municipalityId ? await Municipality.findByPk(municipalityId) : null;

      // attempt to extract sede name from first columns (ESE/ Sede)
      const eseName = row[0] || '';
      const repsCode = row[1] || '';
      const sedeName = row[2] || eseName;

      // bed type might be in column 5 (same as servicios) or near
      const bedTypeName = row[5] || row[6] || row[4] || '';
      const inicial = parseNumber(row[6] || row[7] || row[8]);
      const actual = parseNumber(row[7] || row[8] || row[9]);
      const proyectado = parseNumber(row[8] || row[9] || row[10]);

      if (!bedTypeName) continue;
      parsedBedTypes.add(bedTypeName.trim());
    actions.push({ operation: 'bedCount', eseName, repsCode, sedeName, municipalityCodigo: municipioCodigo, municipalityId, bedTypeName: bedTypeName.trim(), counts: { initial: inicial, current: actual, projected: proyectado } });
      const bedType = await ensureBedType(bedTypeName.trim());
      const sede = await ensureSedeByName(sedeName, repsCode, eseName, municipality ? municipality.id : null);
      parsedSedes.add((sedeName || eseName || '').trim());
      if (municipalityId && !municipality) missingMunicipalities.add(municipalityId);
      await upsertBedCount(sede, bedType, { initial: inicial, current: actual, projected: proyectado });
    }
  }

  console.log('\nImport finished. Summary:');
  console.log('- Unique services parsed:', parsedServices.size);
  console.log('- Unique bed types parsed:', parsedBedTypes.size);
  console.log('- Unique sede names encountered:', parsedSedes.size);
  if (missingMunicipalities.size) {
    console.log('- Municipality codes not found in DB (will leave Sede.MunicipalityId null):', Array.from(missingMunicipalities).slice(0,50));
  } else {
    console.log('- All municipality codes matched to DB municipalities where provided.');
  }
  if (doReport) {
    const outJson = path.join(root, 'import_report.json');
    const outCsv = path.join(root, 'import_report.csv');
    fs.writeFileSync(outJson, JSON.stringify({ parsedServices: Array.from(parsedServices), parsedBedTypes: Array.from(parsedBedTypes), sedes: Array.from(parsedSedes), missingMunicipalities: Array.from(missingMunicipalities), actions }, null, 2), 'utf8');
    // CSV header
    const header = ['operation','eseName','repsCode','sedeName','municipalityCodigo','municipalityId','serviceName','bedTypeName','initial','current','projected'].join(',') + '\n';
    const lines = [header];
    for (const a of actions) {
      const row = [a.operation||'', (a.eseName||'').replace(/,/g,' '),(a.repsCode||'').replace(/,/g,' '),(a.sedeName||'').replace(/,/g,' '),(a.municipalityCodigo||''),(a.municipalityId||''),(a.serviceName||''),(a.bedTypeName||''),(a.counts?.initial||''),(a.counts?.current||''),(a.counts?.projected||'')].join(',') + '\n';
      lines.push(row);
    }
    fs.writeFileSync(outCsv, lines.join(''), 'utf8');
    console.log('- Report written to', outJson, 'and', outCsv);
  }
  process.exit(0);
})();
