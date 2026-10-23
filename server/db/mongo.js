const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emergency_dispatch_supplementary';

// Connect to MongoDB
let isConnected = false;

async function connectMongo() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log('[MongoDB] Connected successfully to', MONGODB_URI);
  } catch (err) {
    console.warn('[MongoDB] Connection warning (optional features will operate gracefully):', err.message);
  }
}

// ── Models for Syllabus Demonstrations (Unit 4: CRUD, Relationships, Indexes, Aggregation) ──

// 1. One-to-One relationship embedded: DispatchSummary
const dispatchSummarySchema = new mongoose.Schema({
  ambulanceAssigned: String,
  estimatedArrivalMin: Number,
  hospitalNotified: Boolean,
  primaryParamedic: String
}, { _id: false });

// 2. IncidentNote Schema with Compound Index (Unit 4: Indexes)
const incidentNoteSchema = new mongoose.Schema({
  incidentId: { type: Number, required: true, index: true },
  note: { type: String, required: true },
  author: { type: String, default: 'Dispatcher' },
  tags: [{ type: String, trim: true }],
  priority: { type: String, enum: ['Routine', 'Urgent', 'Critical'], default: 'Routine' },
  dispatchSummary: dispatchSummarySchema, // Demonstrates One-to-One relationship
  createdAt: { type: Date, default: Date.now }
});

// Compound Index for fast lookup by incidentId and chronological order
incidentNoteSchema.index({ incidentId: 1, createdAt: -1 });

// 3. Tag Schema (Demonstrates Many-to-Many relational logic in NoSQL)
const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, default: 'General' },
  color: { type: String, default: '#007AFF' },
  incidentIds: [{ type: Number }] // Many incidents can have this tag, incident can have many tags
});

// 4. IncidentAttachment Schema (File Upload metadata - Unit 3)
const incidentAttachmentSchema = new mongoose.Schema({
  incidentId: { type: Number, required: true, index: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  uploadedBy: { type: String, default: 'Paramedic Field Unit' },
  createdAt: { type: Date, default: Date.now }
});

// 5. User Schema for Authentication (Unit 6: Login & Registration)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['dispatcher', 'paramedic', 'admin', 'supervisor'], default: 'dispatcher' },
  createdAt: { type: Date, default: Date.now }
});

const IncidentNote = mongoose.model('IncidentNote', incidentNoteSchema);
const Tag = mongoose.model('Tag', tagSchema);
const IncidentAttachment = mongoose.model('IncidentAttachment', incidentAttachmentSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
  connectMongo,
  IncidentNote,
  Tag,
  IncidentAttachment,
  User,
  mongoose
};
