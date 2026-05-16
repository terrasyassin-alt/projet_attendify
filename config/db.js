

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               process.env.DB_PORT     || 3306,
  database:           process.env.DB_NAME     || 'attendify_db',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASS     || '',
  charset:            'utf8mb4',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});


pool.getConnection()
  .then(conn => {
    console.log('✅  MySQL connecté —', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('❌  Erreur MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;