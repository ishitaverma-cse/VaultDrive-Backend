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

        // Create the first version of the file
        await pool.query(
            `
            INSERT INTO file_versions
            (file_id, version_number, name, storage_path, size, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
                result.rows[0].id,
                1,
                file.originalname,
                filePath,
                file.size,
                file.mimetype
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

const createFileVersion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const file = req.file;

        // Check that the file belongs to the logged-in user
        const fileResult = await pool.query(
            `
            SELECT *
            FROM files
            WHERE id = $1
              AND user_id = $2
              AND deleted_at IS NULL
            `,
            [id, userId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const existingFile = fileResult.rows[0];

        // Get the latest version number
        const versionResult = await pool.query(
            `
            SELECT COALESCE(MAX(version_number), 0) AS latest_version
            FROM file_versions
            WHERE file_id = $1
            `,
            [id]
        );

        const nextVersion =
            parseInt(versionResult.rows[0].latest_version) + 1;

        // Create a new storage path for this version
        const filePath = `${userId}/${Date.now()}-${file.originalname}`;

        // Upload new version to Supabase Storage
        const { error: storageError } = await supabase.storage
            .from("vaultdrive-files")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (storageError) {
            console.error("Version storage error:", storageError);

            return res.status(500).json({
                message: "File version upload failed"
            });
        }

        // Save the new version
        await pool.query(
            `
            INSERT INTO file_versions
            (file_id, version_number, name, storage_path, size, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
                id,
                nextVersion,
                file.originalname,
                filePath,
                file.size,
                file.mimetype
            ]
        );

        // Update the current file record
        const updatedFile = await pool.query(
            `
            UPDATE files
            SET
                name = $1,
                original_name = $2,
                size = $3,
                mime_type = $4,
                storage_path = $5,
                updated_at = NOW()
                WHERE id = $6
                AND user_id = $7
                AND deleted_at IS NULL
               RETURNING *
            `,
            [
                file.originalname,
                file.originalname,
                file.size,
                file.mimetype,
                filePath,
                id,
                userId
            ]
        );

        return res.status(200).json({
            message: "New file version created successfully",
            version: {
                version_number: nextVersion,
                file_id: id,
                name: file.originalname,
                storage_path: filePath,
                size: file.size,
                mime_type: file.mimetype
            },
            file: updatedFile.rows[0]
        });

    } catch (error) {
        console.error("Create file version error:", error);

        return res.status(500).json({
            message: "Failed to create file version"
        });
    }
};

const getFileVersions = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Verify that the file belongs to the logged-in user
        const fileResult = await pool.query(
            `
            SELECT id
            FROM files
            WHERE id = $1
              AND user_id = $2
            `,
            [id, userId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                file_id,
                version_number,
                name,
                storage_path,
                size,
                mime_type,
                created_at
            FROM file_versions
            WHERE file_id = $1
            ORDER BY version_number DESC
            `,
            [id]
        );

        return res.status(200).json({
            message: "File versions fetched successfully",
            versions: result.rows
        });

    } catch (error) {
        console.error("Get file versions error:", error);

        return res.status(500).json({
            message: "Failed to fetch file versions"
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

const toggleStarFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `
            UPDATE files
            SET starred = NOT starred
            WHERE id = $1
              AND user_id = $2
              AND deleted_at IS NULL
            RETURNING *
            `,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        return res.status(200).json({
            message: result.rows[0].starred
                ? "File starred successfully"
                : "File unstarred successfully",
            file: result.rows[0]
        });

    } catch (error) {
        console.error("Toggle star error:", error);

        return res.status(500).json({
            message: "Failed to update starred status"
        });
    }
};

const getStarredFiles = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT *
            FROM files
            WHERE user_id = $1
              AND starred = TRUE
              AND deleted_at IS NULL
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            message: "Starred files fetched successfully",
            files: result.rows
        });

    } catch (error) {
        console.error("Get starred files error:", error);

        return res.status(500).json({
            message: "Failed to fetch starred files"
        });
    }
};



module.exports = {
    getFiles,
    uploadFile,
    createFileVersion,
    getFileVersions,
    deleteFile,
    renameFile,
    updateFile,
    searchFiles,
    toggleStarFile,
    getStarredFiles
};