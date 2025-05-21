require('dotenv').config();
const sql = require('mssql');

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // Required for Azure; safe default
    trustServerCertificate: true // Allow self-signed certs, useful in dev
  }
};


let pool;

const connectDB = async () => {
    try {
        pool = await sql.connect(sqlConfig);
        console.log('Connected to SQL Server on who knows!');
        return pool;
    } catch (err) {
        console.error('SQL Server Connection Error:', err);
        throw err;
    }
};

module.exports = { sql, pool, connectDB };
