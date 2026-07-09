const express = require('express');
const router = express.Router();
const userAuth = require("../middleware/userMiddleware");
const {
    createDiscussion,
    getDiscussionsByProblem,
    toggleUpvote,
    addComment
} = require("../controllers/discussion");

// Get all discussions for a problem (authenticated)
router.get('/problem/:problemId', userAuth, getDiscussionsByProblem);

// Create a new discussion thread
router.post('/create/:problemId', userAuth, createDiscussion);

// Toggle upvote on a discussion
router.post('/upvote/:discussionId', userAuth, toggleUpvote);

// Add a comment to a discussion
router.post('/comment/:discussionId', userAuth, addComment);

module.exports = router;
