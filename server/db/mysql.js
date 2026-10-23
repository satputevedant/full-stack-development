const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'emergency_app',
  password: process.env.MYSQL_PASSWORD || 'EmergencyApp_Fix2026!',
  database: process.env.MYSQL_DATABASE || 'emergency_dispatch',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
