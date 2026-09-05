const express = require("express");

const { getFiles, uploadFile, createFileVersion, getFileVersions, deleteFile, renameFile, updateFile, searchFiles, toggleStarFile, getStarredFiles } = require("../controllers/fileController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/starred", authMiddleware, getStarredFiles);
router.get("/", authMiddleware, getFiles);
router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadFile
);
router.post(
    "/:id/version",
    authMiddleware,
    upload.single("file"),
    createFileVersion
);
router.get(
    "/:id/versions",
    authMiddleware,
    getFileVersions
);
router.post("/:id/delete", authMiddleware, deleteFile);
router.post("/:id/rename", authMiddleware, renameFile);
router.post("/:id/update", authMiddleware, updateFile);
router.get("/search", authMiddleware, searchFiles);
router.post("/:id/star", authMiddleware, toggleStarFile);

module.exports = router;