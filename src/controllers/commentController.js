import Comment from "../models/commentModel";


/**
 * Add a Comment to a Recipe
 */
export const addRecipeComment = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { content } = req.body;
        const byUser = req.user.id; // Extracted from verifyToken middleware

        if (!content) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        await validateRecipe(recipeId);
        
        const newComment = await Comment.create({ fromPost: recipeId, byUser, content });
        res.status(201).json({ message: "Comment added", comment: newComment });
    } catch (error) {
        console.error("Add Comment Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
};

/**
 * Update a Comment
 */
export const updateRecipeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const byUser = req.user.id; // Extracted from verifyToken middleware

        if (!content) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const comment = await Comment.findOne({ _id: commentId, byUser, deletedAt: null });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found or already deleted." });
        }

        comment.content = content;
        await comment.save();

        res.status(200).json({ message: "Comment updated", comment });
    } catch (error) {
        console.error("Update Comment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Soft Delete a Comment
 */
export const softDeleteRecipeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const byUser = req.user.id; // Extracted from verifyToken middleware

        const comment = await Comment.findOne({ _id: commentId, byUser, deletedAt: null });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found or already deleted." });
        }

        comment.deletedAt = new Date();
        await comment.save();

        res.status(200).json({ message: "Comment deleted", comment });
    } catch (error) {
        console.error("Delete Comment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

