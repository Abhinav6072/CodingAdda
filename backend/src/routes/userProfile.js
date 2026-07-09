const express = require('express');
const router = express.Router();
const userAuth = require("../middleware/userMiddleware");
const { getUserStats, getUserHeatmap, getLeaderboard } = require("../controllers/userProfile");

// Get user profile stats (needs authentication)
router.get('/stats', userAuth, getUserStats);

// Get user heatmap data (needs authentication)
router.get('/heatmap', userAuth, getUserHeatmap);

// Get global leaderboard (public or authenticated)
router.get('/leaderboard', getLeaderboard);

module.exports = router;
