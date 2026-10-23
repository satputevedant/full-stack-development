// ============================================================
// Syllabus Unit 3: Node.js Debugger Demonstration
// How to run:
//   1. Run with built-in inspector:
//      node inspect demos/unit3-debugger-demo.js
//   2. Or run with Chrome DevTools:
//      node --inspect-brk demos/unit3-debugger-demo.js
//      Then open chrome://inspect in browser
// ============================================================

function calculateResponseMetrics(dispatchedAt, arrivedSceneAt) {
  // Breakpoint 1: inspect input values
  debugger;
  const dispatchTimeMs = new Date(dispatchedAt).getTime();
  const arrivalTimeMs = new Date(arrivedSceneAt).getTime();

  const diffSeconds = (arrivalTimeMs - dispatchTimeMs) / 1000;
  const responseMinutes = diffSeconds / 60;

  // Breakpoint 2: inspect calculated metric
  debugger;
  const isTargetMet = responseMinutes <= 8.0; // Standard 8-minute critical response target

  return {
    diffSeconds,
    responseMinutes: parseFloat(responseMinutes.toFixed(2)),
    isTargetMet
  };
}

console.log('=== Node.js Debugger Demonstration ===');
const sampleDispatch = '2026-10-22T10:00:00Z';
const sampleArrival = '2026-10-22T10:06:30Z';

console.log('Dispatch Time:', sampleDispatch);
console.log('Arrival Time:', sampleArrival);

const result = calculateResponseMetrics(sampleDispatch, sampleArrival);
console.log('Result:', result);
console.log('\nTo debug interactively: run "node inspect demos/unit3-debugger-demo.js" and type "c" to continue or "repl" to inspect variables.');
