const app = require("./index");
const pool = require("./server/config/db");

const PORT = process.env.PORT || 5000;

pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("VaultDrive database connected successfully!");
    console.log("Database time:", result.rows[0].now);
  }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});