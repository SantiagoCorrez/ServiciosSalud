// scripts/normalize_services_bedtypes.js
// Normalizes Service.name and BedType.name by applying a canonicalization function and merges duplicates.
// Usage: node scripts/normalize_services_bedtypes.js [--dry-run]

const dryRun = process.argv.includes('--dry-run');
const fs = require('fs');
const path = require('path');

function normalizeKey(s) {
  if (!s) return '';
  // normalize accents, collapse whitespace, uppercase
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim().toUpperCase();
}

(async function(){
  const Service = require('../models/Service');
  const BedType = require('../models/BedType');
  const SedeService = require('../models/SedeService');
  const BedCount = require('../models/Bed');
  const sequelize = require('../config/database');

  console.log('Normalization started. dryRun=', dryRun);
  await sequelize.authenticate();

  // Process Services
  const services = await Service.findAll();
  const svcMap = new Map();
  for (const s of services) {
    const key = normalizeKey(s.name);
    if (!svcMap.has(key)) svcMap.set(key, []);
    svcMap.get(key).push(s);
  }

  const svcReport = [];
  for (const [key, group] of svcMap.entries()) {
    if (group.length <= 1) continue;
    // Choose canonical: the one with the most Sede associations
    let best = null;
    let bestCount = -1;
    for (const s of group) {
      const count = await s.countSedes();
      if (count > bestCount) { best = s; bestCount = count; }
    }
    const toMerge = group.filter(g => g.id !== best.id);
    svcReport.push({ canonical: { id: best.id, name: best.name }, duplicates: toMerge.map(t=>({ id: t.id, name: t.name })) });
    if (!dryRun) {
      // reassign SedeService rows to best.id but avoid unique constraint errors by
      // handling each SedeService row individually: if canonical link exists for same Sede, merge counts then delete dup link; else update the ServiceId.
      for (const dup of toMerge) {
        const dupLinks = await SedeService.findAll({ where: { ServiceId: dup.id } });
        for (const link of dupLinks) {
          const existing = await SedeService.findOne({ where: { ServiceId: best.id, SedeId: link.SedeId } });
          if (existing) {
            // merge numeric fields: take max when available
            const merged = {
              initial_status: Math.max(existing.initial_status || 0, link.initial_status || 0),
              current_status: Math.max(existing.current_status || 0, link.current_status || 0),
              projected_status: Math.max(existing.projected_status || 0, link.projected_status || 0),
            };
            await existing.update(merged);
            await link.destroy();
          } else {
            // safe to update this row to point to canonical service
            await link.update({ ServiceId: best.id });
          }
        }
        await dup.destroy();
      }
    }
  }

  // Process BedTypes
  const btypes = await BedType.findAll();
  const btMap = new Map();
  for (const b of btypes) {
    const key = normalizeKey(b.name);
    if (!btMap.has(key)) btMap.set(key, []);
    btMap.get(key).push(b);
  }

  const btReport = [];
  for (const [key, group] of btMap.entries()) {
    if (group.length <= 1) continue;
    // Choose canonical by most BedCount associations
    let best = null;
    let bestCount = -1;
    for (const b of group) {
      const count = await b.countBedCounts();
      if (count > bestCount) { best = b; bestCount = count; }
    }
    const toMerge = group.filter(g => g.id !== best.id);
    btReport.push({ canonical: { id: best.id, name: best.name }, duplicates: toMerge.map(t=>({ id: t.id, name: t.name })) });
    if (!dryRun) {
      for (const dup of toMerge) {
        const dupBeds = await BedCount.findAll({ where: { BedTypeId: dup.id } });
        for (const b of dupBeds) {
          const existing = await BedCount.findOne({ where: { BedTypeId: best.id, SedeId: b.SedeId } });
          if (existing) {
            // merge counts: take max for each field
            const merged = {
              initial_count: Math.max(existing.initial_count || 0, b.initial_count || 0),
              current_count: Math.max(existing.current_count || 0, b.current_count || 0),
              projected_count: Math.max(existing.projected_count || 0, b.projected_count || 0),
            };
            await existing.update(merged);
            await b.destroy();
          } else {
            await b.update({ BedTypeId: best.id });
          }
        }
        await dup.destroy();
      }
    }
  }

  const out = { services: svcReport, bedTypes: btReport };
  const outPath = path.join(__dirname, '..', 'normalization_report.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Normalization finished. report at', outPath);
  process.exit(0);
})();
