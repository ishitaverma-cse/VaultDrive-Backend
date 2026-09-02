const pool = require("../config/db");

// Grant or update permission for a user on a file
const setPermission = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { email, role } = req.body;
        const ownerId = req.user.userId;

        if (!email) {
            return res.status(400).json({
                message: "User email is required"
            });
        }

        // Validate role
        if (!["viewer", "editor"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role. Use viewer or editor."
            });
        }

        // Check whether the file belongs to the logged-in user
        const fileResult = await pool.query(
            `SELECT id
             FROM files
             WHERE id = $1
             AND user_id = $2
             AND deleted_at IS NULL`,
            [fileId, ownerId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(403).json({
                message: "Only the file owner can manage permissions"
            });
        }

        // Check whether the target user exists by email
        const userResult = await pool.query(
            `SELECT id
            FROM users
            WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const targetUserId = userResult.rows[0].id;

        // Prevent owner from assigning another role to themselves
        if (String(targetUserId) === String(ownerId)) {
            return res.status(400).json({
                message: "The file owner already has owner permission"
            });
        }

        // Insert or update permission
        const permissionResult = await pool.query(
            `INSERT INTO permissions (file_id, user_id, role)
             VALUES ($1, $2, $3)
             ON CONFLICT (file_id, user_id)
             DO UPDATE SET role = EXCLUDED.role
             RETURNING id, file_id, user_id, role, created_at`,
            [fileId, targetUserId, role]
        );

        res.status(200).json({
            message: "Permission updated successfully",
            permission: permissionResult.rows[0]
        });

    } catch (error) {
        console.error("Set permission error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    setPermission
};