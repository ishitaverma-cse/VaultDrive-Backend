const express = require("express");

const { uploadFile } = require("../controllers/fileController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadFile
);

module.exports = router;