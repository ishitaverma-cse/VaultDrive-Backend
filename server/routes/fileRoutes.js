const express = require("express");

const { getFiles, uploadFile, deleteFile, renameFile, updateFile, searchFiles } = require("../controllers/fileController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getFiles);
router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadFile
);
router.post("/:id/delete", authMiddleware, deleteFile);
router.post("/:id/rename", authMiddleware, renameFile);
router.post("/:id/update", authMiddleware, updateFile);
router.get("/search", authMiddleware, searchFiles);

module.exports = router;