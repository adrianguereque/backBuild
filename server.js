require("dotenv").config();
const { connectDB } = require("./config/db"); // from your mssql-based db config
const app = require("./app");

const PORT = process.env.BACK_PORT || 5000;

app.listen(PORT, async () => {
  try {
    await connectDB(); // Ensure DB is connected

    // Test query
    // result = await pool.request().query("SELECT GETDATE() AS now");
    // console.log("Connected to SQL Server. Current time:", result.recordset[0].now);
  } catch (err) {
    console.error("DB connection failed:", err);
  }
});
