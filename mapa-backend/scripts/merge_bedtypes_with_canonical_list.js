// scripts/merge_bedtypes_with_canonical_list.js
// Map existing BedType rows to a canonical list of bed variables provided by the user.
// Usage: node scripts/merge_bedtypes_with_canonical_list.js [--dry-run] [--report]

const dryRun = process.argv.includes('--dry-run');
const doReport = process.argv.includes('--report');
const fs = require('fs');
const path = require('path');

function normalizeKey(s) {
  if (!s) return '';
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim().toUpperCase();
}

// Canonical bed variables list (from user's input)
const canonicalList = [
  'Adultos',
  'Atención del Parto',
  'Pediátrica',
  'Intensiva Adultos',
  'Intermedia Adultos',
  'Incubadora Básico Neonatal',
  'Incubadora Intensiva Neonatal',
  'Incubadora Intermedia Neonatal',
  'Salud Mental Adulto',
  'TPR',
  'Cuna Básico Neonatal'
];

(async function(){
  const BedType = require('../models/BedType');
  const BedCount = require('../models/Bed');
  const sequelize = require('../config/database');

  console.log('Merge bedtypes started. dryRun=', dryRun, 'report=', doReport);
  await sequelize.authenticate();

  // ensure canonical bedtypes exist
  const canonicalMap = new Map();
  for (const name of canonicalList) {
    const key = normalizeKey(name);
    const [bt, created] = await BedType.findOrCreate({ where: { name }, defaults: { name } });
    canonicalMap.set(key, bt);
  }

  // load existing bedtypes
  const existing = await BedType.findAll();
  const mapping = []; // { existingId, existingName, canonicalId, canonicalName, score }

  // helper: token set for Jaccard
  function tokens(s) {
    return new Set((normalizeKey(s) || '').split(' ').filter(Boolean));
  }

  function jaccard(aSet, bSet) {
    const a = Array.from(aSet);
    const b = Array.from(bSet);
    const inter = a.filter(x => bSet.has(x));
    const union = new Set([...a, ...b]);
    if (union.size === 0) return 0;
    return inter.length / union.size;
  }

  // precompute canonical token sets
  const canonicalTokens = new Map();
  for (const [k, bt] of canonicalMap.entries()) canonicalTokens.set(k, tokens(bt.name));

  for (const b of existing) {
    const bKey = normalizeKey(b.name);
    const bTokens = tokens(b.name);
    // exact normalized match
    if (canonicalMap.has(bKey)) {
      const canonical = canonicalMap.get(bKey);
      if (canonical.id !== b.id) mapping.push({ existingId: b.id, existingName: b.name, canonicalId: canonical.id, canonicalName: canonical.name, score: 1 });
      continue;
    }
    // otherwise find best canonical by Jaccard token overlap
    let best = null; let bestScore = 0;
    for (const [ck, bt] of canonicalMap.entries()) {
      const score = jaccard(bTokens, canonicalTokens.get(ck));
      if (score > bestScore) { bestScore = score; best = bt; }
    }
    // threshold: map if score >= 0.6, else skip and report candidate
    if (best && bestScore >= 0.6 && best.id !== b.id) {
      mapping.push({ existingId: b.id, existingName: b.name, canonicalId: best.id, canonicalName: best.name, score: bestScore });
    }
  }

  const report = { mappings: mapping, applied: [] };

  for (const m of mapping) {
    if (dryRun) {
      console.log('[DRY] Will map BedType', m.existingId, m.existingName, '->', m.canonicalId, m.canonicalName);
      continue;
    }
    // Reassign BedCount rows carefully (merge if canonical already has a BedCount for same Sede)
    const rows = await BedCount.findAll({ where: { BedTypeId: m.existingId } });
    for (const r of rows) {
      const existing = await BedCount.findOne({ where: { BedTypeId: m.canonicalId, SedeId: r.SedeId } });
      if (existing) {
        // merge counts by max
        const merged = {
          initial_count: Math.max(existing.initial_count || 0, r.initial_count || 0),
          current_count: Math.max(existing.current_count || 0, r.current_count || 0),
          projected_count: Math.max(existing.projected_count || 0, r.projected_count || 0),
        };
        await existing.update(merged);
        await r.destroy();
        report.applied.push({ action: 'merged_bedcount', from: r.id, to: existing.id, sedeId: r.SedeId });
      } else {
        await r.update({ BedTypeId: m.canonicalId });
        report.applied.push({ action: 'reassigned_bedcount', id: r.id, newBedTypeId: m.canonicalId, sedeId: r.SedeId });
      }
    }
    // delete the old bedtype
    const old = await BedType.findByPk(m.existingId);
    if (old) { await old.destroy(); report.applied.push({ action: 'deleted_bedtype', id: m.existingId, name: m.existingName }); }
  }

  if (doReport) {
    const out = path.join(__dirname, '..', 'bedtype_merge_report.json');
    fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
    console.log('Report written to', out);
  }

  console.log('Merge finished.');
  process.exit(0);
})();
