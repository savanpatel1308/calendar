require('dotenv').config();
const pool = require('./db');

async function testDBConnection() {
    try {
        const [rows] = await pool.query("SELECT 'Database connected!' AS message");
        console.log(rows[0].message);
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }
}

testDBConnection();
