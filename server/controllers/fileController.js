const supabase = require("../config/supabase");

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
        const { error } = await supabase.storage
            .from("vaultdrive-files")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error("Supabase Storage Error:", error);

            return res.status(500).json({
                message: "File upload failed",
                error: error.message
            });
        }

        return res.status(201).json({
            message: "File uploaded successfully",
            file: {
                name: file.originalname,
                path: filePath,
                size: file.size,
                type: file.mimetype
            }
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