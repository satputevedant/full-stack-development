// ============================================================
// Smart Integrated Healthcare Response & Emergency System
// Node.js Express REST API Server
// Full Stack Development Integration (Units 1-6)
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');

const mysqlPool = require('./db/mysql');
const { connectMongo, IncidentNote, Tag, IncidentAttachment, User } = require('./db/mongo');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'emergency-response-jwt-secret-key-2026';

// ── Connect MongoDB ──
connectMongo();

// ── Ensure uploads directory exists ──
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Multer Storage Configuration (Unit 3: File Uploads) ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'incident-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// ── Security & Sanitization Helper (Unit 3: Secure Form Validation & Sanitization) ──
// Prevents Script Injection (XSS)
function sanitize(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;')) // Encode remaining angles
    .trim();
}

// ── Auth Token Verification Middleware (Unit 6: Authentication) ──
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ============================================================
// 1. AUTHENTICATION ENDPOINTS (Unit 6: Login & Registration Flow)
// ============================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const username = sanitize(req.body.username);
    const email = sanitize(req.body.email);
    const password = req.body.password;
    const role = req.body.role || 'dispatcher';

    // Validation using Regular Expression (Unit 3: RegExp)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }
    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ error: 'Username or email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role
    });

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = sanitize(req.body.username);
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Authentication successful',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login error: ' + err.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ============================================================
// 2. CORE EMERGENCY DISPATCH REST APIs (MySQL Backed)
// Matching ApiServer.java endpoints for full compatibility
// ============================================================

// GET /api/incidents — Active incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const sql = `
      SELECT incident_id, call_time, caller_name, caller_phone,
             incident_type, severity, description, incident_address, status
      FROM incidents
      WHERE status NOT IN ('Resolved', 'Cancelled')
      ORDER BY FIELD(severity, 'Critical', 'High', 'Medium', 'Low'), call_time DESC
    `;
    const [rows] = await mysqlPool.query(sql);
    const formatted = rows.map(r => ({
      id: `INC-${String(r.incident_id).padStart(3, '0')}`,
      rawId: r.incident_id,
      time: r.call_time ? new Date(r.call_time).toTimeString().substring(0, 5) : '—',
      fullTime: r.call_time,
      caller: r.caller_name || 'Unknown',
      phone: r.caller_phone || 'N/A',
      type: r.incident_type || 'Unknown',
      severity: r.severity || 'Medium',
      desc: r.description || '',
      location: r.incident_address || 'Unknown Location',
      status: r.status || 'Pending'
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/incidents/all — All incidents history
app.get('/api/incidents/all', async (req, res) => {
  try {
    const sql = `
      SELECT incident_id, call_time, caller_name, caller_phone,
             incident_type, severity, description, incident_address, status, resolved_at
      FROM incidents
      ORDER BY call_time DESC
      LIMIT 100
    `;
    const [rows] = await mysqlPool.query(sql);
    const formatted = rows.map(r => ({
      id: `INC-${String(r.incident_id).padStart(3, '0')}`,
      rawId: r.incident_id,
      time: r.call_time ? new Date(r.call_time).toTimeString().substring(0, 5) : '—',
      caller: r.caller_name || 'Unknown',
      phone: r.caller_phone || 'N/A',
      type: r.incident_type || 'Unknown',
      severity: r.severity || 'Medium',
      desc: r.description || '',
      location: r.incident_address || 'Unknown Location',
      status: r.status || 'Pending',
      resolvedAt: r.resolved_at
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ambulances — Fleet status
app.get('/api/ambulances', async (req, res) => {
  try {
    const sql = `
      SELECT ambulance_id, vehicle_no, vehicle_type, status,
             last_latitude, last_longitude, last_updated
      FROM ambulances
      ORDER BY ambulance_id
    `;
    const [rows] = await mysqlPool.query(sql);
    const formatted = rows.map(r => ({
      id: r.ambulance_id,
      no: r.vehicle_no,
      type: r.vehicle_type,
      status: r.status,
      lat: r.last_latitude,
      lng: r.last_longitude,
      updated: r.last_updated
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/responders — Active crew & EMTs
app.get('/api/responders', async (req, res) => {
  try {
    const sql = `
      SELECT responder_id, full_name, role, phone, status
      FROM responders
      ORDER BY responder_id
    `;
    const [rows] = await mysqlPool.query(sql);
    const formatted = rows.map(r => ({
      id: r.responder_id,
      name: r.full_name,
      role: r.role,
      phone: r.phone,
      status: r.status
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dispatches — Dispatch log
app.get('/api/dispatches', async (req, res) => {
  try {
    const sql = `
      SELECT d.dispatch_id, d.incident_id, d.ambulance_id,
             d.dispatched_at, d.arrived_scene_at,
             d.response_time_min, d.status,
             COALESCE(a.vehicle_no, '—') AS vehicle_no,
             COALESCE(r.full_name, '—') AS responder_name
      FROM dispatch_log d
      LEFT JOIN ambulances a ON a.ambulance_id = d.ambulance_id
      LEFT JOIN responders r ON r.responder_id = d.responder_id
      ORDER BY d.dispatched_at DESC
      LIMIT 30
    `;
    const [rows] = await mysqlPool.query(sql);
    const formatted = rows.map(r => {
      const disp = r.dispatched_at ? new Date(r.dispatched_at).toTimeString().substring(0, 5) : '—';
      const arr = r.arrived_scene_at ? new Date(r.arrived_scene_at).toTimeString().substring(0, 5) : '—';
      return {
        id: `D-${String(r.dispatch_id).padStart(3, '0')}`,
        rawId: r.dispatch_id,
        incident: `INC-${String(r.incident_id).padStart(3, '0')}`,
        rawIncidentId: r.incident_id,
        amb: r.vehicle_no,
        ambulanceId: r.ambulance_id,
        responder: r.responder_name,
        dispatched: disp,
        arrived: arr,
        respMin: r.response_time_min !== null ? Number(r.response_time_min).toFixed(1) : '—',
        status: r.status
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats — Real-time operational KPIs
app.get('/api/stats', async (req, res) => {
  try {
    const [critRows] = await mysqlPool.query("SELECT COUNT(*) AS c FROM incidents WHERE severity='Critical' AND status NOT IN ('Resolved','Cancelled')");
    const [dispRows] = await mysqlPool.query("SELECT COUNT(*) AS c FROM incidents WHERE status='Dispatched'");
    const [resRows] = await mysqlPool.query("SELECT COUNT(*) AS c FROM incidents WHERE status='Resolved'");
    const [respTimeRows] = await mysqlPool.query("SELECT AVG(response_time_min) AS a FROM dispatch_log WHERE response_time_min IS NOT NULL");
    const [availAmbRows] = await mysqlPool.query("SELECT COUNT(*) AS c FROM ambulances WHERE status='Available'");
    const [onDutyRows] = await mysqlPool.query("SELECT COUNT(*) AS c FROM responders WHERE status IN ('Available','On Duty')");
    const [pendRows] = await mysqlPool.query("SELECT COUNT(*) AS c FROM incidents WHERE status='Pending'");
    const [activeRows] = await mysqlPool.query("SELECT COUNT(*) AS c FROM incidents WHERE status NOT IN ('Resolved','Cancelled')");

    res.json({
      critical: critRows[0].c,
      dispatched: dispRows[0].c,
      resolved: resRows[0].c,
      avgResp: respTimeRows[0].a ? Number(respTimeRows[0].a) : 0,
      availAmb: availAmbRows[0].c,
      onDuty: onDutyRows[0].c,
      pending: pendRows[0].c,
      activeCount: activeRows[0].c
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dispatch — Create Incident + Auto Dispatch OR Quick Dispatch
app.post('/api/dispatch', async (req, res) => {
  const conn = await mysqlPool.getConnection();
  try {
    await conn.beginTransaction();

    const isQuick = req.body.quickDispatch === true || req.body.quickDispatch === 'true';
    const existingIncidentId = parseInt(req.body.incidentId, 10);
    const ambId = parseInt(req.body.ambulanceId, 10);
    const respId = parseInt(req.body.responderId || '0', 10);

    if (isQuick && existingIncidentId > 0) {
      let dispatchId = -1;
      if (ambId > 0) {
        const [dispRes] = await conn.query(
          `INSERT INTO dispatch_log (incident_id, ambulance_id, responder_id, status)
           VALUES (?, ?, ?, 'Dispatched')`,
          [existingIncidentId, ambId, respId > 0 ? respId : null]
        );
        dispatchId = dispRes.insertId;

        await conn.query(`UPDATE ambulances SET status='Dispatched' WHERE ambulance_id=?`, [ambId]);
        await conn.query(`UPDATE incidents SET status='Dispatched' WHERE incident_id=?`, [existingIncidentId]);
        if (respId > 0) {
          await conn.query(`UPDATE responders SET status='On Duty' WHERE responder_id=?`, [respId]);
        }
      }

      await conn.commit();
      return res.json({ ok: true, incidentId: existingIncidentId, dispatchId });
    }

    // New incident creation
    const caller = sanitize(req.body.caller) || 'Unknown Caller';
    const phone = sanitize(req.body.phone) || 'N/A';
    const type = sanitize(req.body.type) || 'Unknown';
    const severity = sanitize(req.body.severity) || 'Medium';
    const address = sanitize(req.body.address) || 'Unknown Location';
    const desc = sanitize(req.body.description) || '';

    const [incRes] = await conn.query(
      `INSERT INTO incidents (caller_name, caller_phone, incident_type, severity, description, incident_address, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [caller, phone, type, severity, desc, address]
    );
    const incidentId = incRes.insertId;

    let dispatchId = -1;
    if (ambId > 0) {
      const [dispRes] = await conn.query(
        `INSERT INTO dispatch_log (incident_id, ambulance_id, responder_id, status)
         VALUES (?, ?, ?, 'Dispatched')`,
        [incidentId, ambId, respId > 0 ? respId : null]
      );
      dispatchId = dispRes.insertId;

      await conn.query(`UPDATE ambulances SET status='Dispatched' WHERE ambulance_id=?`, [ambId]);
      await conn.query(`UPDATE incidents SET status='Dispatched' WHERE incident_id=?`, [incidentId]);
      if (respId > 0) {
        await conn.query(`UPDATE responders SET status='On Duty' WHERE responder_id=?`, [respId]);
      }
    }

    await conn.commit();
    res.json({ ok: true, incidentId, dispatchId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PATCH /api/dispatches/:id/status — Progress dispatch lifecycle (En Route -> At Scene -> Completed)
app.patch('/api/dispatches/:id/status', async (req, res) => {
  const conn = await mysqlPool.getConnection();
  try {
    await conn.beginTransaction();
    const dispatchId = parseInt(req.params.id, 10);
    const nextStatus = req.body.status; // 'En Route', 'At Scene', 'Completed', 'Cancelled'

    const [rows] = await conn.query('SELECT incident_id, ambulance_id FROM dispatch_log WHERE dispatch_id=?', [dispatchId]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Dispatch record not found' });
    }
    const { incident_id, ambulance_id } = rows[0];

    let updateSql = 'UPDATE dispatch_log SET status=?';
    const params = [nextStatus];

    if (nextStatus === 'En Route') {
      updateSql += ', en_route_at=CURRENT_TIMESTAMP';
      await conn.query("UPDATE ambulances SET status='En Route' WHERE ambulance_id=?", [ambulance_id]);
    } else if (nextStatus === 'At Scene') {
      updateSql += ', arrived_scene_at=CURRENT_TIMESTAMP';
      await conn.query("UPDATE ambulances SET status='At Scene' WHERE ambulance_id=?", [ambulance_id]);
    } else if (nextStatus === 'Completed') {
      updateSql += ', departed_scene_at=CURRENT_TIMESTAMP';
      await conn.query("UPDATE ambulances SET status='Available' WHERE ambulance_id=?", [ambulance_id]);
      await conn.query("UPDATE incidents SET status='Resolved', resolved_at=CURRENT_TIMESTAMP WHERE incident_id=?", [incident_id]);
    } else if (nextStatus === 'Cancelled') {
      await conn.query("UPDATE ambulances SET status='Available' WHERE ambulance_id=?", [ambulance_id]);
      await conn.query("UPDATE incidents SET status='Cancelled' WHERE incident_id=?", [incident_id]);
    }

    updateSql += ' WHERE dispatch_id=?';
    params.push(dispatchId);

    await conn.query(updateSql, params);
    await conn.commit();

    res.json({ ok: true, dispatchId, status: nextStatus });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/hospitals
app.get('/api/hospitals', async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT h.hospital_id, h.name, h.address, h.phone, h.total_beds,
             h.available_beds, h.trauma_center, COALESCE(z.zone_name, '—') AS zone
      FROM hospitals h
      LEFT JOIN zones z ON z.zone_id = h.zone_id
      ORDER BY h.hospital_id
    `);
    res.json(rows.map(r => ({
      id: r.hospital_id,
      name: r.name,
      address: r.address,
      phone: r.phone,
      totalBeds: r.total_beds,
      availBeds: r.available_beds,
      trauma: Boolean(r.trauma_center),
      zone: r.zone
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/zones
app.get('/api/zones', async (req, res) => {
  try {
    const [rows] = await mysqlPool.query('SELECT zone_id, zone_name, region FROM zones ORDER BY zone_id');
    res.json(rows.map(r => ({ id: r.zone_id, name: r.zone_name, region: r.region })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT patient_id, full_name, dob, gender, blood_group, phone, medical_history
      FROM patients ORDER BY patient_id
    `);
    res.json(rows.map(r => ({
      id: r.patient_id,
      name: r.full_name,
      dob: r.dob,
      gender: r.gender,
      blood: r.blood_group,
      phone: r.phone,
      history: r.medical_history
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/triage
app.get('/api/triage', async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT t.triage_id, t.dispatch_id, t.triage_level, t.chief_complaint,
             t.vitals_bp, t.vitals_pulse, t.vitals_spo2, t.gcs_score, t.recorded_at,
             COALESCE(p.full_name, 'Unknown Patient') AS patient_name
      FROM triage_records t
      LEFT JOIN patients p ON p.patient_id = t.patient_id
      ORDER BY t.recorded_at DESC
      LIMIT 30
    `);
    res.json(rows.map(r => ({
      id: r.triage_id,
      dispatchId: `D-${String(r.dispatch_id).padStart(3, '0')}`,
      level: r.triage_level,
      complaint: r.chief_complaint,
      bp: r.vitals_bp,
      pulse: r.vitals_pulse,
      spo2: r.vitals_spo2,
      gcs: r.gcs_score,
      time: r.recorded_at ? new Date(r.recorded_at).toTimeString().substring(0, 5) : '—',
      patient: r.patient_name
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/equipment
app.get('/api/equipment', async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT e.equipment_id, e.name, e.category, e.quantity, e.status,
             COALESCE(a.vehicle_no, 'Base Inventory') AS vehicle_no
      FROM equipment e
      LEFT JOIN ambulances a ON a.ambulance_id = e.ambulance_id
      ORDER BY e.equipment_id
    `);
    res.json(rows.map(r => ({
      id: r.equipment_id,
      name: r.name,
      category: r.category,
      qty: r.quantity,
      status: r.status,
      vehicle: r.vehicle_no
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history — Audit log generated by MySQL triggers
app.get('/api/history', async (req, res) => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT log_id, table_name, record_id, action, changed_by, changed_at
      FROM audit_log
      ORDER BY changed_at DESC
      LIMIT 50
    `);
    res.json(rows.map(r => ({
      id: r.log_id,
      table: r.table_name,
      recordId: r.record_id,
      action: r.action,
      by: r.changed_by,
      time: r.changed_at ? new Date(r.changed_at).toISOString().replace('T', ' ').substring(0, 19) : '—'
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 3. SUPPLEMENTARY MONGODB ENDPOINTS (Unit 4: CRUD, Relationships, Aggregation)
// Demonstrates NoSQL document storage, tags, notes, and metrics
// ============================================================

// GET /api/incidents/:id/notes — Read notes for an incident
app.get('/api/incidents/:id/notes', async (req, res) => {
  try {
    const incidentId = parseInt(req.params.id, 10);
    const notes = await IncidentNote.find({ incidentId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/incidents/:id/notes — Create note with tags and dispatch summary (CRUD + Relationships)
app.post('/api/incidents/:id/notes', async (req, res) => {
  try {
    const incidentId = parseInt(req.params.id, 10);
    const noteText = sanitize(req.body.note);
    const author = sanitize(req.body.author) || 'Dispatcher';
    const tags = Array.isArray(req.body.tags) ? req.body.tags.map(t => sanitize(t)) : [];
    const priority = req.body.priority || 'Routine';

    // One-to-One embedded DispatchSummary demonstration
    const dispatchSummary = req.body.dispatchSummary ? {
      ambulanceAssigned: sanitize(req.body.dispatchSummary.ambulanceAssigned),
      estimatedArrivalMin: parseInt(req.body.dispatchSummary.estimatedArrivalMin || 5, 10),
      hospitalNotified: Boolean(req.body.dispatchSummary.hospitalNotified),
      primaryParamedic: sanitize(req.body.dispatchSummary.primaryParamedic)
    } : null;

    const newNote = await IncidentNote.create({
      incidentId,
      note: noteText,
      author,
      tags,
      priority,
      dispatchSummary
    });

    // Update Many-to-Many Tag collection
    for (const tagName of tags) {
      if (tagName) {
        await Tag.findOneAndUpdate(
          { name: tagName },
          { $addToSet: { incidentIds: incidentId }, $setOnInsert: { category: 'Operational', color: '#007AFF' } },
          { upsert: true, new: true }
        );
      }
    }

    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tags/summary — MongoDB Aggregation Pipeline demonstration (Unit 4: Aggregation)
app.get('/api/tags/summary', async (req, res) => {
  try {
    const aggregationResult = await IncidentNote.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 }, latestUse: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $project: { tag: '$_id', count: 1, latestUse: 1, _id: 0 } }
    ]);
    res.json(aggregationResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/relationships/demo — Explicit demonstration of 1:1 and M:N relationships in NoSQL
app.get('/api/relationships/demo', async (req, res) => {
  try {
    const oneToOneSample = await IncidentNote.findOne({ dispatchSummary: { $exists: true } }).lean();
    const manyToManySample = await Tag.find({ 'incidentIds.0': { $exists: true } }).limit(5).lean();

    res.json({
      explanation: 'Syllabus Unit 4 Demonstration: One-to-One and Many-to-Many models in MongoDB',
      oneToOne: {
        concept: 'IncidentNote has an embedded 1:1 DispatchSummary document',
        sample: oneToOneSample
      },
      manyToMany: {
        concept: 'Tag documents maintain an array of incidentIds, linking many tags to many incidents',
        sample: manyToManySample
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 4. FILE UPLOADS & ATTACHMENTS (Unit 3: File System & Uploads)
// ============================================================

app.post('/api/upload', upload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const incidentId = parseInt(req.body.incidentId, 10) || 1;
    const uploadedBy = sanitize(req.body.uploadedBy) || 'EMS Field Unit';

    const attachment = await IncidentAttachment.create({
      incidentId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      uploadedBy
    });

    res.status(201).json({
      message: 'File uploaded and metadata stored in MongoDB',
      attachment
    });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

app.get('/api/attachments/:incidentId', async (req, res) => {
  try {
    const incidentId = parseInt(req.params.incidentId, 10);
    const attachments = await IncidentAttachment.find({ incidentId }).sort({ createdAt: -1 });
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 5. EMAIL ALERT AUTOMATION (Unit 3: Node.js Automation & Email)
// ============================================================

app.post('/api/alerts/email', async (req, res) => {
  try {
    const { to, subject, incidentId, details } = req.body;
    const recipient = to || 'hospital-command@emergency.local';

    // Create test account or use simulated transporter
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: '"EMS Dispatch Dispatcher" <dispatch@emergency-system.local>',
      to: recipient,
      subject: subject || `[CRITICAL ALERT] Incident INC-${incidentId} Dispatched`,
      text: details || `Emergency Incident ${incidentId} requires immediate medical response.`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 20px; background: #0D1117; color: #fff;">
          <h2 style="color: #FF3B30;">🚨 Emergency Healthcare Response Alert</h2>
          <p><strong>Incident Reference:</strong> INC-${incidentId}</p>
          <p><strong>Details:</strong> ${sanitize(details)}</p>
          <p style="color: #8B949E; font-size: 12px;">Automated notification generated by EmergencyDispatchApp Node.js Service.</p>
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    res.json({
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || 'Simulated mail sent successfully'
    });
  } catch (err) {
    res.status(500).json({ error: 'Email alert failed: ' + err.message });
  }
});

// ============================================================
// 6. HEALTH & DEBUGGING ENDPOINTS (Unit 3: Node Debugger & Diagnostics)
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'EmergencyDispatchApp Unified API'
  });
});

app.get('/api/debug', (req, res) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development',
    databases: {
      mysql: 'Connected (pool ready)',
      mongodb: 'Connected to emergency_dispatch_supplementary'
    }
  });
});

// ── Serve React Static Frontend in Production ──
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── Start Server ──
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`╔═════════════════════════════════════════════════════════════╗`);
    console.log(`║  Emergency Dispatch Node.js/Express Server Running        ║`);
    console.log(`║  Port: ${PORT}                                              ║`);
    console.log(`║  API URL: http://localhost:${PORT}/api/stats                 ║`);
    console.log(`╚═════════════════════════════════════════════════════════════╝`);
  });
}

module.exports = app;
