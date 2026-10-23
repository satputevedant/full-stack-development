// ============================================================
// Syllabus Unit 4: Relational Logic in NoSQL
// Demonstrating One-to-One and Many-to-Many Relationships
// Run: node demos/unit4-mongo-relationships.js
// ============================================================

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emergency_dispatch_supplementary';

// ── 1. ONE-TO-ONE RELATIONSHIP: Embedded Document Pattern ──
// Each IncidentSummary has exactly ONE TriageAssessment
const triageAssessmentSchema = new mongoose.Schema({
  triageColor: { type: String, enum: ['Red', 'Yellow', 'Green', 'Black'] },
  glasgowComaScale: Number,
  leadParamedic: String
}, { _id: false });

const incidentRecordSchema = new mongoose.Schema({
  incidentCode: String,
  location: String,
  // 1:1 Embedded relationship
  triage: triageAssessmentSchema
});

// ── 2. MANY-TO-MANY RELATIONSHIP: Referenced Array Pattern ──
// Responders can have MANY Certifications, and Certifications belong to MANY Responders
const certificationSchema = new mongoose.Schema({
  name: String,       // e.g., 'ACLS - Advanced Cardiac Life Support'
  issuingBody: String // e.g., 'AHA'
});

const fieldResponderSchema = new mongoose.Schema({
  name: String,
  role: String,
  // M:N Array of ObjectIDs referencing Certification documents
  certifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DemoCertification' }]
});

const IncidentRecord = mongoose.model('DemoIncidentRecord', incidentRecordSchema);
const Certification = mongoose.model('DemoCertification', certificationSchema);
const FieldResponder = mongoose.model('DemoFieldResponder', fieldResponderSchema);

async function runRelationshipsDemo() {
  console.log('=== Syllabus Unit 4: One-to-One & Many-to-Many in MongoDB ===');
  await mongoose.connect(MONGODB_URI);

  // Clear demo data
  await Promise.all([
    IncidentRecord.deleteMany({ incidentCode: /^REL-/ }),
    Certification.deleteMany({}),
    FieldResponder.deleteMany({})
  ]);

  // 1. DEMONSTRATE ONE-TO-ONE
  console.log('\n--- 1. One-to-One Relationship (Embedded Document) ---');
  const incident = await IncidentRecord.create({
    incidentCode: 'REL-INC-501',
    location: 'Airport Terminal 2 Gate 14',
    triage: {
      triageColor: 'Red',
      glasgowComaScale: 11,
      leadParamedic: 'EMT Robert Vance'
    }
  });
  console.log('1:1 Incident Created with Embedded Triage:');
  console.log(JSON.stringify(incident, null, 2));

  // 2. DEMONSTRATE MANY-TO-MANY
  console.log('\n--- 2. Many-to-Many Relationship (Referenced ObjectIds with .populate()) ---');
  const [certAcls, certPhtls] = await Certification.create([
    { name: 'ACLS (Advanced Cardiac Life Support)', issuingBody: 'American Heart Association' },
    { name: 'PHTLS (Prehospital Trauma Life Support)', issuingBody: 'NAEMT' }
  ]);

  const responder1 = await FieldResponder.create({
    name: 'Sarah Connor',
    role: 'Flight Paramedic',
    certifications: [certAcls._id, certPhtls._id] // Has both certs
  });

  const responder2 = await FieldResponder.create({
    name: 'John Miller',
    role: 'Ambulance Driver / EMT',
    certifications: [certPhtls._id] // Has PHTLS
  });

  // Query using Mongoose populate() to resolve many-to-many references
  const populatedResponders = await FieldResponder.find().populate('certifications');
  console.log('Many-to-Many Populated Query Result:');
  populatedResponders.forEach(r => {
    console.log(`Responder: ${r.name} (${r.role})`);
    console.log('Certifications:', r.certifications.map(c => c.name));
  });

  await mongoose.disconnect();
  console.log('\n=== Relationships Demonstration Complete! ===');
}

if (require.main === module) {
  runRelationshipsDemo().catch(console.error);
}

module.exports = runRelationshipsDemo;
