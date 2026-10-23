// ============================================================
// Seed realistic synthetic data into MySQL & MongoDB
// Only inserts if incidents table is empty
// ============================================================

const mysqlPool = require('./db/mysql');
const { connectMongo, IncidentNote, Tag } = require('./db/mongo');

async function seed() {
  await connectMongo();
  const [incCount] = await mysqlPool.query('SELECT COUNT(*) as c FROM incidents');
  if (incCount[0].c === 0) {
    console.log('[Seed] Seeding realistic synthetic emergency incidents...');

    // 1. Insert synthetic incidents
    const [inc1] = await mysqlPool.query(`
      INSERT INTO incidents (caller_name, caller_phone, incident_type, severity, description, incident_address, status)
      VALUES ('Sarah Jenkins', '9876543210', 'Cardiac Arrest', 'Critical', 'Elderly patient collapsed at home, CPR ongoing by bystander', '42 Elm Street, Central Zone', 'Dispatched')
    `);
    const [inc2] = await mysqlPool.query(`
      INSERT INTO incidents (caller_name, caller_phone, incident_type, severity, description, incident_address, status)
      VALUES ('Officer Martinez', '9876543211', 'Road Accident', 'High', 'Two-vehicle collision with passenger entrapment', 'Highway 101 Northbound Mile 4', 'Dispatched')
    `);
    const [inc3] = await mysqlPool.query(`
      INSERT INTO incidents (caller_name, caller_phone, incident_type, severity, description, incident_address, status)
      VALUES ('David Kumar', '9876543212', 'Respiratory', 'Medium', 'Severe asthma attack, inhaler ineffective', '15 Maple Avenue, East Wing', 'Pending')
    `);

    // 2. Fetch ambulance IDs
    const [ambs] = await mysqlPool.query('SELECT ambulance_id FROM ambulances LIMIT 2');
    const [resps] = await mysqlPool.query('SELECT responder_id FROM responders LIMIT 2');

    if (ambs.length >= 2 && resps.length >= 2) {
      await mysqlPool.query(`
        INSERT INTO dispatch_log (incident_id, ambulance_id, responder_id, status, dispatched_at, arrived_scene_at)
        VALUES (?, ?, ?, 'En Route', DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE))
      `, [inc1.insertId, ambs[0].ambulance_id, resps[0].responder_id]);

      await mysqlPool.query(`
        INSERT INTO dispatch_log (incident_id, ambulance_id, responder_id, status, dispatched_at, arrived_scene_at)
        VALUES (?, ?, ?, 'At Scene', DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 14 MINUTE))
      `, [inc2.insertId, ambs[1].ambulance_id, resps[1].responder_id]);

      await mysqlPool.query(`UPDATE ambulances SET status='En Route' WHERE ambulance_id=?`, [ambs[0].ambulance_id]);
      await mysqlPool.query(`UPDATE ambulances SET status='At Scene' WHERE ambulance_id=?`, [ambs[1].ambulance_id]);
      await mysqlPool.query(`UPDATE responders SET status='On Duty' WHERE responder_id IN (?, ?)`, [resps[0].responder_id, resps[1].responder_id]);
    }

    console.log('[Seed] MySQL synthetic data seeded successfully.');

    // 3. Seed MongoDB Notes & Tags for these incidents
    await IncidentNote.create([
      {
        incidentId: inc1.insertId,
        note: 'AED attached. Patient rhythm analyzed as VFib. Shock delivered.',
        author: 'Paramedic Davis',
        tags: ['Cardiac', 'Priority-1', 'AED-Used'],
        priority: 'Critical',
        dispatchSummary: {
          ambulanceAssigned: 'AMB-101',
          estimatedArrivalMin: 3,
          hospitalNotified: true,
          primaryParamedic: 'Dr. Michael Chen'
        }
      },
      {
        incidentId: inc2.insertId,
        note: 'Fire department on scene. Extrication tool deployed for trapped driver.',
        author: 'Dispatcher Miller',
        tags: ['Trauma', 'MCI', 'Extrication'],
        priority: 'Urgent',
        dispatchSummary: {
          ambulanceAssigned: 'AMB-102',
          estimatedArrivalMin: 6,
          hospitalNotified: true,
          primaryParamedic: 'EMT Sarah Taylor'
        }
      }
    ]);

    await Tag.create([
      { name: 'Cardiac', category: 'Medical', color: '#FF3B30', incidentIds: [inc1.insertId] },
      { name: 'Priority-1', category: 'Triage', color: '#FF9500', incidentIds: [inc1.insertId] },
      { name: 'Trauma', category: 'Trauma', color: '#AF52DE', incidentIds: [inc2.insertId] },
      { name: 'Extrication', category: 'Hazards', color: '#FF2D55', incidentIds: [inc2.insertId] }
    ]);

    console.log('[Seed] MongoDB synthetic notes and tags seeded.');
  } else {
    console.log('[Seed] Data already present in MySQL, skipping seed.');
  }

  process.exit(0);
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
