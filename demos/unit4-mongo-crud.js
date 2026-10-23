// ============================================================
// Syllabus Unit 4: MongoDB CRUD Operations (Create, Read, Update, Delete)
// Connects to local MongoDB and tests complete lifecycle
// Run: node demos/unit4-mongo-crud.js
// ============================================================

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emergency_dispatch_supplementary';

// Define Demo Schema
const patientLogSchema = new mongoose.Schema({
  patientCode: { type: String, required: true, unique: true },
  triagePriority: String,
  conditionNotes: String,
  vitals: { bp: String, pulse: Number, spo2: Number },
  active: { type: Boolean, default: true },
  loggedAt: { type: Date, default: Date.now }
});

const PatientLog = mongoose.model('DemoPatientLog', patientLogSchema);

async function runCrudDemo() {
  console.log('=== Syllabus Unit 4: MongoDB CRUD Operations ===');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  // 1. CREATE (Insert)
  console.log('\n1. CREATE: Inserting emergency patient clinical log...');
  await PatientLog.deleteMany({ patientCode: /^DEMO-/ }); // clean previous demo runs

  const created = await PatientLog.create({
    patientCode: 'DEMO-PT-889',
    triagePriority: 'Immediate',
    conditionNotes: 'Diabetic ketoacidosis with altered mental state',
    vitals: { bp: '90/60', pulse: 124, spo2: 94 }
  });
  console.log('Created Document ID:', created._id, 'Patient:', created.patientCode);

  // 2. READ (Find & Query)
  console.log('\n2. READ: Querying immediate priority records...');
  const found = await PatientLog.findOne({ patientCode: 'DEMO-PT-889' });
  console.log('Found Document:', {
    code: found.patientCode,
    priority: found.triagePriority,
    vitals: found.vitals
  });

  // 3. UPDATE (UpdateOne with $set)
  console.log('\n3. UPDATE: Updating patient vitals after IV fluid bolus...');
  await PatientLog.updateOne(
    { patientCode: 'DEMO-PT-889' },
    { $set: { 'vitals.bp': '115/75', 'vitals.pulse': 88, conditionNotes: 'Vitals stabilized following IV saline' } }
  );
  const updated = await PatientLog.findOne({ patientCode: 'DEMO-PT-889' });
  console.log('Updated Document Vitals:', updated.vitals, 'Notes:', updated.conditionNotes);

  // 4. DELETE (DeleteOne)
  console.log('\n4. DELETE: Removing demo patient record...');
  const deleteResult = await PatientLog.deleteOne({ patientCode: 'DEMO-PT-889' });
  console.log('Deleted Count:', deleteResult.deletedCount);

  await mongoose.disconnect();
  console.log('\n=== CRUD Demonstration Completed Successfully! ===');
}

if (require.main === module) {
  runCrudDemo().catch(console.error);
}

module.exports = runCrudDemo;
