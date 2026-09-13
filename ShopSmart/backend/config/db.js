const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shopsmart',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL connected successfully to database:', process.env.DB_NAME || 'shopsmart');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Make sure MySQL is running and .env is configured correctly.');
  });

module.exports = pool;
