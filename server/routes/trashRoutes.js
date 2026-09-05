const express = require("express");

const router = express.Router();

const { getTrash, restoreItem, permanentlyDeleteItem } = require("../controllers/trashController");

const authMiddleware = require("../middleware/authMiddleware");

// Get deleted files and folders
router.post("/", authMiddleware, getTrash);
router.post("/:type/:id/restore", authMiddleware, restoreItem);
router.delete("/:type/:id/permanent", authMiddleware, permanentlyDeleteItem);

module.exports = router;