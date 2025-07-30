const mysql = require('mysql2/promise');
  const dotenv = require('dotenv');
  dotenv.config();

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pran@2005', // Fallback to default if not set
    database: process.env.DB_NAME || 'family_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const connect = async () => {
    try {
      await pool.getConnection();
      console.log('MySQL connected');
    } catch (error) {
      console.error('Database connection error:', error);
      process.exit(1);
    }
  };

  module.exports = { pool, connect };