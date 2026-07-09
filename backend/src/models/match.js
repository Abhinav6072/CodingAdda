const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'forfeited'],
        default: 'ongoing'
    }
}, { timestamps: true });

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
