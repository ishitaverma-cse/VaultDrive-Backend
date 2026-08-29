const supabase = require("../config/supabase");
const pool = require("../config/db");

const getFiles = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validate pagination parameters
        if (page < 1 || limit < 1) {
            return res.status(400).json({
                message: "Page and limit must be positive numbers"
            });
        }

        // Calculate how many records to skip
        const offset = (page - 1) * limit;

        // Fetch paginated files
        const filesResult = await pool.query(
            `
            SELECT *
            FROM files
            WHERE user_id = $1
              AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT $2
            OFFSET $3
            `,
            [userId, limit, offset]
        );

        // Get total number of files
        const countResult = await pool.query(
            `
            SELECT COUNT(*)
            FROM files
            WHERE user_id = $1
              AND deleted_at IS NULL
            `,
            [userId]
        );

        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            message: "Files fetched successfully",
            files: filesResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.error("Get files server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

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

const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const { data, error } = await supabase
            .from("files")
            .update({
                deleted_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_id", userId)
            .is("deleted_at", null)
            .select()
            .single();

        if (error) {
            console.error("Delete file error:", error);

            return res.status(500).json({
                message: "Failed to delete file"
            });
        }

        if (!data) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        return res.status(200).json({
            message: "File moved to trash successfully",
            file: data
        });

    } catch (error) {
        console.error("Delete file server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const renameFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "File name is required"
            });
        }

        const { data, error } = await supabase
            .from("files")
            .update({
                name: name.trim(),
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_id", userId)
            .is("deleted_at", null)
            .select()
            .single();

        if (error) {
            console.error("Rename file error:", error);

            return res.status(500).json({
                message: "Failed to rename file"
            });
        }

        if (!data) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        return res.status(200).json({
            message: "File renamed successfully",
            file: data
        });

    } catch (error) {
        console.error("Rename file server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const updateFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { folder_id } = req.body;
        const userId = req.user.userId;

        // If a folder is provided, verify that it belongs to the user
        if (folder_id) {
            const { data: folder, error: folderError } = await supabase
                .from("folders")
                .select("id")
                .eq("id", folder_id)
                .eq("user_id", userId)
                .is("deleted_at", null)
                .single();

            if (folderError || !folder) {
                return res.status(404).json({
                    message: "Folder not found"
                });
            }
        }

        const { data, error } = await supabase
            .from("files")
            .update({
                folder_id: folder_id || null,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_id", userId)
            .is("deleted_at", null)
            .select()
            .single();

        if (error) {
            console.error("Update file error:", error);

            return res.status(500).json({
                message: "Failed to update file"
            });
        }

        if (!data) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        return res.status(200).json({
            message: "File updated successfully",
            file: data
        });

    } catch (error) {
        console.error("Update file server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const searchFiles = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({
                message: "Search query is required"
            });
        }

        const result = await pool.query(
            `
            SELECT *
            FROM files
            WHERE user_id = $1
              AND deleted_at IS NULL
              AND to_tsvector(
                    'english',
                    coalesce(name, '') || ' ' || coalesce(original_name, '')
                  )
                  @@ plainto_tsquery('english', $2)
            ORDER BY created_at DESC
            `,
            [userId, q.trim()]
        );

        return res.status(200).json({
            message: "Files searched successfully",
            files: result.rows
        });

    } catch (error) {
        console.error("Search files error:", error);

        return res.status(500).json({
            message: "Failed to search files"
        });
    }
};

module.exports = {
    getFiles,
    uploadFile,
    deleteFile,
    renameFile,
    updateFile,
    searchFiles
};