const express = require("express");
const router = express.Router();

const { createFolder, getFolders, renameFolder, updateFolder, deleteFolder } = require("../controllers/folderController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new folder
router.post("/", authMiddleware, createFolder);
router.get("/", authMiddleware, getFolders);
router.post("/:id/rename", authMiddleware, renameFolder);
router.post("/:id/update", authMiddleware, updateFolder);
router.post("/:id/delete", authMiddleware, deleteFolder);

module.exports = router;