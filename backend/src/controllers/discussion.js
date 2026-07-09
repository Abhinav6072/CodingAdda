const Discussion = require("../models/discussion");

const createDiscussion = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.problemId;
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        // Check if the user has already posted a discussion for this problem
        const existingDiscussion = await Discussion.findOne({ problemId, userId });
        if (existingDiscussion) {
            return res.status(400).json({ message: "You have already posted a discussion for this problem. Only one post per user is allowed." });
        }

        const newDiscussion = await Discussion.create({
            problemId,
            userId,
            title,
            content
        });

        // Populate user details before returning
        const populatedDiscussion = await Discussion.findById(newDiscussion._id)
            .populate("userId", "firstName lastName");

        res.status(201).json(populatedDiscussion);
    } catch (err) {
        console.error("Error creating discussion:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

const getDiscussionsByProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const discussions = await Discussion.find({ problemId })
            .populate("userId", "firstName lastName")
            .populate("comments.userId", "firstName lastName")
            .sort({ createdAt: -1 });

        res.status(200).json(discussions);
    } catch (err) {
        console.error("Error fetching discussions:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

const toggleUpvote = async (req, res) => {
    try {
        const userId = req.result._id;
        const discussionId = req.params.discussionId;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        const upvoteIndex = discussion.upvotes.indexOf(userId);
        if (upvoteIndex === -1) {
            // Add upvote
            discussion.upvotes.push(userId);
        } else {
            // Remove upvote
            discussion.upvotes.splice(upvoteIndex, 1);
        }

        await discussion.save();
        res.status(200).json({ upvotes: discussion.upvotes.length, hasUpvoted: upvoteIndex === -1 });
    } catch (err) {
        console.error("Error toggling upvote:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

const addComment = async (req, res) => {
    try {
        const userId = req.result._id;
        const discussionId = req.params.discussionId;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion not found" });
        }

        discussion.comments.push({ userId, text });
        await discussion.save();

        // Populate the new comment's user before sending back
        const populatedDiscussion = await Discussion.findById(discussionId)
            .populate("comments.userId", "firstName lastName");

        res.status(201).json(populatedDiscussion.comments);
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createDiscussion,
    getDiscussionsByProblem,
    toggleUpvote,
    addComment
};
