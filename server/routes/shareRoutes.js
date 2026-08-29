const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createShareLink, accessSharedFile } = require("../controllers/shareController");

// Create a shareable link for a file
router.post("/:fileId", authMiddleware, createShareLink);
router.get("/access/:shareToken", accessSharedFile);

module.exports = router;