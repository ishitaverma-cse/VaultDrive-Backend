const express = require("express");
const cors = require("cors");   //allow communication b/w F & B. 
require("dotenv").config();     // to load values from .env
const authRoutes = require("./server/routes/authRoutes");
const fileRoutes = require("./server/routes/fileRoutes");
const folderRoutes = require("./server/routes/folderRoutes");
const trashRoutes = require("./server/routes/trashRoutes");
const shareRoutes = require("./server/routes/shareRoutes");
const permissionRoutes = require("./server/routes/permissionRoutes");
const signedUrlRoutes = require("./server/routes/signedUrlRoutes");

const app = express();

app.use(cors());
app.use(express.json());    //allows us to receive JSON req bodies.


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/files", signedUrlRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "File Management System Backend is running!"
    });
});

module.exports = app;