const supabase = require("../config/supabase");

const createFolder = async (req, res) => {
    try {
        const { name, parent_folder_id } = req.body;

        // Validate folder name
        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Folder name is required"
            });
        }

        // Get authenticated user from JWT middleware
        const userId = req.user.userId;

        // If creating a nested folder, verify parent folder
        if (parent_folder_id) {
            const { data: parentFolder, error: parentError } = await supabase
                .from("folders")
                .select("id")
                .eq("id", parent_folder_id)
                .eq("user_id", userId)
                .single();

            if (parentError || !parentFolder) {
                return res.status(404).json({
                    message: "Parent folder not found"
                });
            }
        }

        // Create folder
        const { data, error } = await supabase
            .from("folders")
            .insert([
                {
                    name: name.trim(),
                    user_id: userId,
                    parent_folder_id: parent_folder_id || null
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Create folder error:", error);

            return res.status(500).json({
                message: "Failed to create folder"
            });
        }

        return res.status(201).json({
            message: "Folder created successfully",
            folder: data
        });

    } catch (error) {
        console.error("Create folder server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const getFolders = async (req, res) => {
    try {
        // Get authenticated user from JWT
        const userId = req.user.userId;

        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq("user_id", userId)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Get folders error:", error);

            return res.status(500).json({
                message: "Failed to fetch folders"
            });
        }

        return res.status(200).json({
            message: "Folders fetched successfully",
            folders: data
        });

    } catch (error) {
        console.error("Get folders server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const renameFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Folder name is required"
            });
        }

        const { data, error } = await supabase
            .from("folders")
            .update({
                name: name.trim(),
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Rename folder error:", error);

            return res.status(500).json({
                message: "Failed to rename folder"
            });
        }

        return res.status(200).json({
            message: "Folder renamed successfully",
            folder: data
        });

    } catch (error) {
        console.error("Rename folder server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parent_folder_id } = req.body;
        const userId = req.user.userId;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Folder name is required"
            });
        }

        // If moving folder to a parent folder, verify that parent belongs to user
        if (parent_folder_id) {
            const { data: parentFolder, error: parentError } = await supabase
                .from("folders")
                .select("id")
                .eq("id", parent_folder_id)
                .eq("user_id", userId)
                .single();

            if (parentError || !parentFolder) {
                return res.status(404).json({
                    message: "Parent folder not found"
                });
            }
        }

        const { data, error } = await supabase
            .from("folders")
            .update({
                name: name.trim(),
                parent_folder_id: parent_folder_id || null,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Update folder error:", error);

            return res.status(500).json({
                message: "Failed to update folder"
            });
        }

        return res.status(200).json({
            message: "Folder updated successfully",
            folder: data
        });

    } catch (error) {
        console.error("Update folder server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const { data, error } = await supabase
            .from("folders")
            .update({
                deleted_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_id", userId)
            .is("deleted_at", null)
            .select()
            .single();

        if (error) {
            console.error("Delete folder error:", error);

            return res.status(500).json({
                message: "Failed to delete folder"
            });
        }

        if (!data) {
            return res.status(404).json({
                message: "Folder not found"
            });
        }

        return res.status(200).json({
            message: "Folder moved to trash successfully",
            folder: data
        });

    } catch (error) {
        console.error("Delete folder server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createFolder,
    getFolders,
    renameFolder,
    updateFolder,
    deleteFolder
};