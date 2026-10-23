// ============================================================
// Syllabus Unit 3: Node.js File System, URL Module & Events
// Demonstrates EventEmitter and File System Operations
// Run: node demos/unit3-node-fs-events.js
// ============================================================

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { URL } = require('url');

// 1. Custom Emergency Dispatch Event Emitter
class DispatchEventEmitter extends EventEmitter {}
const dispatchEvents = new DispatchEventEmitter();

const LOG_FILE = path.join(__dirname, 'emergency_events.log');

// 2. Event Listeners for Dispatch Lifecycle
dispatchEvents.on('incident:reported', (incident) => {
  const logEntry = `[${new Date().toISOString()}] EVENT: Incident #${incident.id} reported at ${incident.address} (Severity: ${incident.severity})\n`;
  console.log('⚡', logEntry.trim());
  fs.appendFileSync(LOG_FILE, logEntry);
});

dispatchEvents.on('ambulance:dispatched', ({ incidentId, vehicleNo, etaMin }) => {
  const logEntry = `[${new Date().toISOString()}] DISPATCH: Unit ${vehicleNo} assigned to Incident #${incidentId}. ETA: ${etaMin} min\n`;
  console.log('🚑', logEntry.trim());
  fs.appendFileSync(LOG_FILE, logEntry);
});

// 3. URL Module Demonstration
function parseDispatchUrl(urlString) {
  const myUrl = new URL(urlString);
  console.log('\n--- Node.js URL Module Demonstration ---');
  console.log('Protocol:', myUrl.protocol);
  console.log('Host:', myUrl.host);
  console.log('Pathname:', myUrl.pathname);
  console.log('Query Params (Incident ID):', myUrl.searchParams.get('incidentId'));
  console.log('----------------------------------------\n');
}

// Execute demonstration
console.log('=== Testing Node.js Events & File System Logging ===');

// Clear prior log
if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

// Emit events
dispatchEvents.emit('incident:reported', { id: 101, address: '42 Central Avenue', severity: 'Critical' });
dispatchEvents.emit('ambulance:dispatched', { incidentId: 101, vehicleNo: 'AMB-101', etaMin: 4 });

// Verify file system written
const content = fs.readFileSync(LOG_FILE, 'utf-8');
console.log('Verified Log File Written to Disk:');
console.log(content);

// Test URL parsing
parseDispatchUrl('http://localhost:5000/api/dispatch?incidentId=101&vehicle=AMB-101');

console.log('Unit 3 Events & File System Demo Succeeded!');
