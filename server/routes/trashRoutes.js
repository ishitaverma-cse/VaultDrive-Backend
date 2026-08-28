const express = require("express");

const router = express.Router();

const { getTrash, restoreItem } = require("../controllers/trashController");

const authMiddleware = require("../middleware/authMiddleware");

// Get deleted files and folders
router.post("/", authMiddleware, getTrash);
router.post("/:type/:id/restore", authMiddleware, restoreItem);

module.exports = router;