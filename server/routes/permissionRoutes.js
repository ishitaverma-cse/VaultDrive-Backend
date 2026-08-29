const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { setPermission } = require("../controllers/permissionController");

// Grant or update permission for a user on a file
router.post("/:fileId", authMiddleware, setPermission);

module.exports = router;