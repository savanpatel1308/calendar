require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,        // MySQL Host (localhost)
  user: process.env.DB_USER,        // MySQL Username (root)
  password: process.env.DB_PASSWORD, // MySQL Password (from .env)
  database: process.env.DB_NAME,    // Database Name (calendar_db)
  port: process.env.DB_PORT,        // MySQL Port (3306)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to MySQL database successfully!");
        connection.release();  // Release the connection back to the pool
    }
});

module.exports = pool.promise();

