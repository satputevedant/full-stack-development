// ============================================================
// Automated End-to-End API Test Suite
// Uses Node.js native test runner (node:test) and assertions (node:assert)
// Zero extra test runner dependencies required!
// Run: npm test
// ============================================================

const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../server/server');
const mysqlPool = require('../server/db/mysql');
const { mongoose } = require('../server/db/mongo');

const TEST_PORT = 5099;
let server;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, resolve);
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
  await mongoose.disconnect();
  await mysqlPool.end();
  process.exit(0);
});

test('1. Healthcheck & Diagnostics Endpoint', async () => {
  const res = await fetch(`http://localhost:${TEST_PORT}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'healthy');
  assert.ok(data.uptimeSeconds >= 0);
});

test('2. Debug & Environment Diagnostics Endpoint', async () => {
  const res = await fetch(`http://localhost:${TEST_PORT}/api/debug`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.databases.mysql.includes('Connected'));
  assert.ok(data.databases.mongodb.includes('Connected'));
});

test('3. Core MySQL Statistics Endpoint (/api/stats)', async () => {
  const res = await fetch(`http://localhost:${TEST_PORT}/api/stats`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(typeof data.critical === 'number');
  assert.ok(typeof data.availAmb === 'number');
  assert.ok(typeof data.onDuty === 'number');
});

test('4. Active Incidents Query (/api/incidents)', async () => {
  const res = await fetch(`http://localhost:${TEST_PORT}/api/incidents`);
  assert.strictEqual(res.status, 200);
  const incidents = await res.json();
  assert.ok(Array.isArray(incidents));
  if (incidents.length > 0) {
    assert.ok(incidents[0].id.startsWith('INC-'));
    assert.ok(incidents[0].severity);
  }
});

test('5. Ambulance Fleet & Responders Query', async () => {
  const ambRes = await fetch(`http://localhost:${TEST_PORT}/api/ambulances`);
  assert.strictEqual(ambRes.status, 200);
  const ambulances = await ambRes.json();
  assert.ok(Array.isArray(ambulances));
  assert.ok(ambulances.length > 0);

  const respRes = await fetch(`http://localhost:${TEST_PORT}/api/responders`);
  assert.strictEqual(respRes.status, 200);
  const responders = await respRes.json();
  assert.ok(Array.isArray(responders));
  assert.ok(responders.length > 0);
});

test('6. User Authentication: Register, Login, & JWT Verification (Unit 6)', async () => {
  const testUser = {
    username: 'dispatcher_test_' + Date.now(),
    email: `test_${Date.now()}@emergency.local`,
    password: 'SecurePassword123!',
    role: 'dispatcher'
  };

  // 1. Register
  const regRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  assert.ok(regData.token);

  // 2. Login
  const loginRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: testUser.username, password: testUser.password })
  });
  assert.strictEqual(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.ok(loginData.token);

  // 3. Verify Protected Route
  const meRes = await fetch(`http://localhost:${TEST_PORT}/api/auth/me`, {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  assert.strictEqual(meRes.status, 200);
  const meData = await meRes.json();
  assert.strictEqual(meData.user.username, testUser.username);
});

test('7. Input Sanitization against XSS Script Injection (Unit 3)', async () => {
  const maliciousPayload = {
    caller: '<script>alert("XSS")</script>Dr. BadActor',
    phone: '9988776655',
    type: 'Trauma',
    severity: 'Medium',
    address: '<b>Main St</b> <script>stealCookies()</script>',
    description: 'Safe Description'
  };

  const res = await fetch(`http://localhost:${TEST_PORT}/api/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(maliciousPayload)
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.ok);

  // Verify that script tag was stripped from DB
  const incRes = await fetch(`http://localhost:${TEST_PORT}/api/incidents`);
  const incidents = await incRes.json();
  const created = incidents.find(i => i.rawId === data.incidentId);
  assert.ok(created);
  assert.ok(!created.caller.includes('<script>'));
  assert.ok(!created.location.includes('<script>'));
});

test('8. Supplementary MongoDB Notes & Aggregation Pipeline (Unit 4)', async () => {
  const notePayload = {
    note: 'Automated test clinical observation note',
    author: 'Test Paramedic',
    tags: ['AutomatedTestTag', 'Cardiac'],
    priority: 'Critical'
  };

  const addNoteRes = await fetch(`http://localhost:${TEST_PORT}/api/incidents/1/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notePayload)
  });
  assert.strictEqual(addNoteRes.status, 201);

  // Check notes retrieval
  const getNotesRes = await fetch(`http://localhost:${TEST_PORT}/api/incidents/1/notes`);
  assert.strictEqual(getNotesRes.status, 200);
  const notes = await getNotesRes.json();
  assert.ok(notes.some(n => n.tags && n.tags.includes('AutomatedTestTag')));

  // Test Aggregation Pipeline
  const aggRes = await fetch(`http://localhost:${TEST_PORT}/api/tags/summary`);
  assert.strictEqual(aggRes.status, 200);
  const tagSummary = await aggRes.json();
  assert.ok(Array.isArray(tagSummary));
  assert.ok(tagSummary.some(t => t.tag === 'AutomatedTestTag'));
});
