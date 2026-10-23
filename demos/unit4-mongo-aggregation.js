// ============================================================
// Syllabus Unit 4: MongoDB Aggregation & Indexes
// Demonstrates Aggregation Pipeline ($match, $group, $sort)
// and Compound Index Creation
// Run: node demos/unit4-mongo-aggregation.js
// ============================================================

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emergency_dispatch_supplementary';

const telemetrySchema = new mongoose.Schema({
  ambulanceId: { type: String, required: true },
  zone: { type: String, required: true },
  speedKmh: Number,
  batteryPct: Number,
  fuelPct: Number,
  status: String,
  recordedAt: { type: Date, default: Date.now }
});

// Create Compound Index for fast zone-based status lookups
telemetrySchema.index({ zone: 1, status: 1 });

const Telemetry = mongoose.model('DemoTelemetry', telemetrySchema);

async function runAggregationDemo() {
  console.log('=== Syllabus Unit 4: MongoDB Aggregation & Indexes ===');
  await mongoose.connect(MONGODB_URI);

  await Telemetry.deleteMany({});

  // Seed sample telemetry data across zones
  console.log('Inserting sample fleet telemetry data...');
  await Telemetry.create([
    { ambulanceId: 'AMB-101', zone: 'Central', speedKmh: 65, batteryPct: 88, fuelPct: 75, status: 'En Route' },
    { ambulanceId: 'AMB-102', zone: 'Central', speedKmh: 0, batteryPct: 95, fuelPct: 90, status: 'Available' },
    { ambulanceId: 'AMB-103', zone: 'East', speedKmh: 45, batteryPct: 70, fuelPct: 60, status: 'At Scene' },
    { ambulanceId: 'AMB-104', zone: 'East', speedKmh: 0, batteryPct: 92, fuelPct: 85, status: 'Available' },
    { ambulanceId: 'AMB-105', zone: 'West', speedKmh: 72, batteryPct: 65, fuelPct: 55, status: 'En Route' },
    { ambulanceId: 'AMB-106', zone: 'Central', speedKmh: 0, batteryPct: 98, fuelPct: 95, status: 'Available' }
  ]);

  // 1. COMPOUND INDEX DEMONSTRATION
  console.log('\n--- 1. Compound Index Verification ---');
  const indexes = await Telemetry.collection.indexes();
  console.log('Active Indexes on Telemetry Collection:', indexes.map(i => i.name));

  // 2. AGGREGATION PIPELINE DEMONSTRATION
  console.log('\n--- 2. Multi-Stage Aggregation Pipeline ---');
  console.log('Pipeline: $match → $group → $sort → $project');

  const aggregationResult = await Telemetry.aggregate([
    // Stage 1: $match (filter records)
    { $match: { fuelPct: { $gte: 50 } } },

    // Stage 2: $group (aggregate by zone, compute statistics)
    {
      $group: {
        _id: '$zone',
        totalAmbulances: { $sum: 1 },
        avgSpeed: { $avg: '$speedKmh' },
        avgFuel: { $avg: '$fuelPct' },
        availableCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
        }
      }
    },

    // Stage 3: $sort (order by total ambulances descending)
    { $sort: { totalAmbulances: -1 } },

    // Stage 4: $project (shape the final output)
    {
      $project: {
        zone: '$_id',
        totalAmbulances: 1,
        avgSpeed: { $round: ['$avgSpeed', 1] },
        avgFuelPct: { $round: ['$avgFuel', 1] },
        availableCount: 1,
        _id: 0
      }
    }
  ]);

  console.log('Aggregation Pipeline Results:');
  console.table(aggregationResult);

  await mongoose.disconnect();
  console.log('=== Aggregation & Index Demo Complete! ===');
}

if (require.main === module) {
  runAggregationDemo().catch(console.error);
}

module.exports = runAggregationDemo;
