const supabase = require("../config/supabase");
const pool = require("../config/db");

const uploadFile = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const file = req.file;

        // Get authenticated user's ID
        const userId = req.user.userId;

        // Create a unique file path for the user
        const filePath = `${userId}/${Date.now()}-${file.originalname}`;

        // Upload file to Supabase Storage
        const { error: storageError } = await supabase.storage
            .from("vaultdrive-files")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        // Check if Supabase upload failed
        if (storageError) {
            console.error("Supabase Storage Error:", storageError);

            return res.status(500).json({
                message: "File upload failed",
                error: storageError.message
            });
        }

        // Save file metadata in PostgreSQL
        const result = await pool.query(
            `INSERT INTO files
            (name, original_name, size, mime_type, storage_path, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                file.originalname,
                file.originalname,
                file.size,
                file.mimetype,
                filePath,
                userId
            ]
        );

        // Send successful response
        return res.status(201).json({
            message: "File uploaded successfully",
            file: result.rows[0]
        });

    } catch (error) {
        console.error("Upload Error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    uploadFile
};