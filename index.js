const express = require("express");
const pool = require("./server/config/db");
const cors = require("cors");   //allow communication b/w F & B. 
require("dotenv").config();     // to load values from .env
const authRoutes = require("./server/routes/authRoutes");
const fileRoutes = require("./server/routes/fileRoutes");
const folderRoutes = require("./server/routes/folderRoutes");
const trashRoutes = require("./server/routes/trashRoutes");

const app = express();

app.use(cors());
app.use(express.json());    //allows us to receive JSON req bodies.
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("VaultDrive database connected successfully!");
    console.log("Database time:", result.rows[0].now);
  }
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/trash", trashRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "File Management System Backend is running!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});