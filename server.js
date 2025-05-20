require("dotenv").config();
const { pool, connectDB } = require("./config/db"); // Updated import
const app = require("./app");

const PORT = process.env.BACK_PORT || 5000;

app.listen(PORT, async () => {
    await connectDB();

    pool.query('SELECT NOW()', (err, results) => {
        if (err) throw err;
        console.log(results);
    });
});
