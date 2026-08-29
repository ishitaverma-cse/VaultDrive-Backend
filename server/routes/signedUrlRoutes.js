const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { generateSignedUrl } = require("../controllers/signedUrlController");

// Generate a temporary signed URL for a file
router.post("/:fileId/signed-url", authMiddleware, generateSignedUrl);

module.exports = router;