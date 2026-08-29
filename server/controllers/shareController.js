const crypto = require("crypto");
const pool = require("../config/db");
const supabase = require("../config/supabase");

// Create a secure shareable link for a file
const createShareLink = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.userId;

        console.log("File ID:", fileId);
        console.log("Authenticated User:", req.user);
        console.log("User ID used for sharing:", userId);

        // Check whether the file exists and belongs to the logged-in user
        const fileResult = await pool.query(
            `SELECT id, name
             FROM files
             WHERE id = $1
             AND user_id = $2
             AND deleted_at IS NULL`,
            [fileId, userId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({
                message: "File not found or you do not have permission to share it"
            });
        }

        // Generate a cryptographically secure random token
        const shareToken = crypto.randomBytes(32).toString("hex");

        // Store the share token
        const shareResult = await pool.query(
            `INSERT INTO file_shares
                (file_id, created_by, share_token)
             VALUES
                ($1, $2, $3)
             RETURNING id, file_id, share_token, expires_at, created_at`,
            [fileId, userId, shareToken]
        );

        res.status(201).json({
            message: "Share link created successfully",
            share: shareResult.rows[0]
        });

    } catch (error) {
        console.error("Create share link error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// Access a shared file using a share token
const accessSharedFile = async (req, res) => {
    try {
        const { shareToken } = req.params;

        // Find the share and associated file
        const shareResult = await pool.query(
            `SELECT
                fs.id AS share_id,
                fs.file_id,
                fs.expires_at,
                f.name,
                f.storage_path
             FROM file_shares fs
             JOIN files f ON fs.file_id = f.id
             WHERE fs.share_token = $1
             AND f.deleted_at IS NULL`,
            [shareToken]
        );

        if (shareResult.rows.length === 0) {
            return res.status(404).json({
                message: "Invalid or expired share link"
            });
        }

        const share = shareResult.rows[0];

        // Check whether the share link has expired
        if (
            share.expires_at &&
            new Date(share.expires_at) < new Date()
        ) {
            return res.status(410).json({
                message: "Share link has expired"
            });
        }

        // Generate temporary signed URL
        const { data, error } = await supabase.storage
            .from("vaultdrive-files")
            .createSignedUrl(share.storage_path, 3600);

        if (error) {
            console.error("Shared file signed URL error:", error);

            return res.status(500).json({
                message: "Failed to generate secure file URL"
            });
        }

        res.status(200).json({
            message: "Shared file accessed successfully",
            file: {
                id: share.file_id,
                name: share.name
            },
            signed_url: data.signedUrl,
            expires_in: 3600
        });

    } catch (error) {
        console.error("Access shared file error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createShareLink,
    accessSharedFile
};