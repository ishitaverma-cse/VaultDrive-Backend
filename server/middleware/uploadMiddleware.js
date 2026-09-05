const multer = require("multer");

// Store uploaded file temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024   // 50 MB
    }
});

module.exports = upload;