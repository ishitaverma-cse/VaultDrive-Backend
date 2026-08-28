const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if Authorization header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication token required",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token -> checks whether the token was actually signed with our secret key and whether it has expired.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user information to request
        req.user = decoded;

        // Continue to the next middleware/controller
        next();
        
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

module.exports = authMiddleware;