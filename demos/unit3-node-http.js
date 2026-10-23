// ============================================================
// Syllabus Unit 3: Node.js Core Modules & HTTP Module
// Zero extra dependencies — uses built-in 'http' and 'url'
// Run: node demos/unit3-node-http.js
// ============================================================

const http = require('http');
const { URL } = require('url');

const PORT = process.env.DEMO_HTTP_PORT || 5050;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');

  console.log(`[Node HTTP Core] Received ${req.method} request for ${pathname}`);

  if (pathname === '/' || pathname === '/status') {
    const zone = searchParams.get('zone') || 'All Zones';
    res.writeHead(200);
    return res.end(JSON.stringify({
      message: 'Emergency Dispatch HTTP Core Module Response',
      zoneRequested: zone,
      systemStatus: 'ONLINE',
      timestamp: new Date().toISOString(),
      activeFleet: ['AMB-101', 'AMB-102', 'AMB-103'],
      nodeVersion: process.version
    }, null, 2));
  }

  if (pathname === '/ping') {
    res.writeHead(200);
    return res.end(JSON.stringify({ ping: 'pong', uptime: process.uptime() }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Endpoint not found', availableEndpoints: ['/', '/status?zone=East', '/ping'] }));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Unit 3 Demo] Core Node.js HTTP Server running on http://localhost:${PORT}`);
    console.log(`Try: curl http://localhost:${PORT}/status?zone=Central`);
  });
}

module.exports = server;
