// scripts/verify_import_samples.js
// Prints sedes, bedCounts and services for sample municipalities to verify import

(async function(){
  const Municipality = require('../models/Municipality');
  const Sede = require('../models/Sede');
  const BedCount = require('../models/Bed');
  const Service = require('../models/Service');
  const SedeService = require('../models/SedeService');
  const BedType = require('../models/BedType');

  const sample = [25001, 25269, 25899];
  for (const mId of sample) {
    console.log('\n=== Municipality', mId, '===');
    const mun = await Municipality.findByPk(mId, { include: [{ model: Sede, include: [BedCount, { model: Service, through: SedeService }] }] });
    if (!mun) { console.log('Municipality not found:', mId); continue; }
    console.log('Municipality:', mun.name);
    for (const sede of mun.Sedes || []) {
      console.log('- Sede:', sede.id, sede.name, 'reps_code=', sede.reps_code);
      const beds = await BedCount.findAll({ where: { SedeId: sede.id }, include: [BedType] });
      if (beds && beds.length) {
        console.log('  Beds:');
        for (const b of beds) console.log('   ', b.BedTypeId, b.BedType ? b.BedType.name : '', 'initial', b.initial_count, 'current', b.current_count);
      }
      const services = await sede.getServices();
      if (services && services.length) {
        console.log('  Services:', services.map(s=>s.name).join(', '));
      }
    }
  }
  process.exit(0);
})();
