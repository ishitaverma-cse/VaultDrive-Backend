const supabase = require("../config/supabase");

const getTrash = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get deleted files
        const { data: files, error: fileError } = await supabase
            .from("files")
            .select("*")
            .eq("user_id", userId)       //one user cannot see another user's trash
            .not("deleted_at", "is", null);

        if (fileError) {
            console.error("Get trash files error:", fileError);

            return res.status(500).json({
                message: "Failed to fetch deleted files"
            });
        }

        // Get deleted folders
        const { data: folders, error: folderError } = await supabase
            .from("folders")
            .select("*")
            .eq("user_id", userId)
            .not("deleted_at", "is", null);

        if (folderError) {
            console.error("Get trash folders error:", folderError);

            return res.status(500).json({
                message: "Failed to fetch deleted folders"
            });
        }

        return res.status(200).json({
            message: "Trash fetched successfully",
            files,
            folders
        });

    } catch (error) {
        console.error("Get trash server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const restoreItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        const userId = req.user.userId;

        // Validate item type
        if (type !== "file" && type !== "folder") {
            return res.status(400).json({
                message: "Invalid item type. Use file or folder"
            });
        }

        const table = type === "file" ? "files" : "folders";

        // Restore the item by clearing deleted_at
        const { data, error } = await supabase
            .from(table)
            .update({
                deleted_at: null
            })
            .eq("id", id)
            .eq("user_id", userId)
            .not("deleted_at", "is", null)
            .select()
            .single();

        if (error) {
            console.error("Restore item error:", error);

            return res.status(500).json({
                message: `Failed to restore ${type}`
            });
        }

        if (!data) {
            return res.status(404).json({
                message: `${type} not found in trash`
            });
        }

        return res.status(200).json({
            message: `${type} restored successfully`,
            [type]: data
        });

    } catch (error) {
        console.error("Restore item server error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getTrash,
    restoreItem
};