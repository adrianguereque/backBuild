require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = async () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Connection Error:', err);
                reject(err);
            } else {
                console.log('Connected to MySQL on Railway!');
                connection.release(); // Optional: release immediately after test
                resolve(pool);
            }
        });
    });
};

module.exports = { pool, connectDB };
