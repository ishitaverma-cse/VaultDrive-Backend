const express = require("express");
const {
    registerUser,
    loginUser
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/profile", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Protected route accessed successfully",
        user: req.user
    });
});

module.exports = router;