const mysql = require('mysql2/promise.js');
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;