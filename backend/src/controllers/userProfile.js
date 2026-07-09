const User = require("../models/user");
const Submission = require("../models/submission");
const Problem = require("../models/problem");

const getUserStats = async (req, res) => {
    try {
        const userId = req.result._id;
        
        // Fetch User and populate solved problems to get their difficulty
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "difficulty"
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate breakdown
        let easy = 0, medium = 0, hard = 0;
        
        user.problemSolved.forEach(problem => {
            if (problem.difficulty) {
                const diff = problem.difficulty.toLowerCase();
                if (diff === 'easy') easy++;
                else if (diff === 'medium') medium++;
                else if (diff === 'hard') hard++;
            }
        });

        res.status(200).json({
            points: user.points || 0,
            currentStreak: user.currentStreak || 0,
            maxStreak: user.maxStreak || 0,
            totalSolved: user.problemSolved.length,
            breakdown: { easy, medium, hard }
        });
    } catch (err) {
        console.error("Error in getUserStats:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

const getUserHeatmap = async (req, res) => {
    try {
        const userId = req.result._id;
        
        // Fetch all accepted submissions for this user
        const submissions = await Submission.find({ 
            userId, 
            status: 'accepted' 
        }).select("createdAt");

        // Format data: { "YYYY-MM-DD": count }
        const heatmapData = {};
        
        submissions.forEach(sub => {
            const dateObj = new Date(sub.createdAt);
            const dateStr = dateObj.toISOString().split('T')[0];
            heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
        });

        // Convert to array of objects for easier frontend mapping
        const result = Object.keys(heatmapData).map(date => ({
            date,
            count: heatmapData[date]
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error("Error in getUserHeatmap:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        // Fetch top 50 users sorted by points (descending)
        const leaderboard = await User.find({})
            .sort({ points: -1 })
            .limit(50)
            .select("firstName lastName points currentStreak");
            
        res.status(200).json(leaderboard);
    } catch (err) {
        console.error("Error in getLeaderboard:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getUserStats,
    getUserHeatmap,
    getLeaderboard
};
