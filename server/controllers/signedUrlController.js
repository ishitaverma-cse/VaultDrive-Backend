const pool = require("../config/db");
const supabase = require("../config/supabase");

// Generate a temporary signed URL for a file
const generateSignedUrl = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.userId;

        // Check file ownership
        const fileResult = await pool.query(
            `SELECT id, name, storage_path
             FROM files
             WHERE id = $1
             AND user_id = $2
             AND deleted_at IS NULL`,
            [fileId, userId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({
                message: "File not found or you do not have permission to access it"
            });
        }

        const file = fileResult.rows[0];

        // Generate signed URL valid for 1 hour
        const { data, error } = await supabase.storage
            .from("vaultdrive-files")
            .createSignedUrl(file.storage_path, 3600);

        if (error) {
            console.error("Signed URL error:", error);

            return res.status(500).json({
                message: "Failed to generate signed URL"
            });
        }

        res.status(200).json({
            message: "Signed URL generated successfully",
            file: {
                id: file.id,
                name: file.name
            },
            signed_url: data.signedUrl,
            expires_in: 3600
        });

    } catch (error) {
        console.error("Generate signed URL error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    generateSignedUrl
};