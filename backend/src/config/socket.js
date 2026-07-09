const { Server } = require("socket.io");
const Problem = require("../models/problem");
const Match = require("../models/match");

let io;
// A simple array queue: stores objects like { socketId, userId, userObj }
let waitingQueue = [];
// Active rooms mapping: roomId -> { player1: userId, player2: userId, problemId, matchId }
const activeRooms = new Map();
// Socket ID to user info
const socketUsers = new Map(); 

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        socket.on("joinQueue", async (data) => {
            const { userId, firstName, lastName } = data;
            
            // Avoid duplicate queue entries for the same user
            waitingQueue = waitingQueue.filter(u => u.userId !== userId);
            
            const userObj = { socketId: socket.id, userId, firstName, lastName };
            socketUsers.set(socket.id, userObj);
            
            waitingQueue.push(userObj);
            console.log(`User ${firstName} joined queue. Queue length: ${waitingQueue.length}`);

            // Try to matchmake
            if (waitingQueue.length >= 2) {
                const player1 = waitingQueue.shift();
                const player2 = waitingQueue.shift();

                try {
                    // Pick a random problem (could be enhanced to pick by difficulty later)
                    // Currently just taking one problem for testing
                    const count = await Problem.countDocuments();
                    const random = Math.floor(Math.random() * count);
                    const randomProblem = await Problem.findOne().skip(random);

                    if (!randomProblem) {
                        throw new Error("No problems available for matchmaking");
                    }

                    // Create Match in DB
                    const newMatch = await Match.create({
                        player1: player1.userId,
                        player2: player2.userId,
                        problemId: randomProblem._id
                    });

                    const roomId = `room_${newMatch._id}`;

                    // Add sockets to room
                    const p1Socket = io.sockets.sockets.get(player1.socketId);
                    const p2Socket = io.sockets.sockets.get(player2.socketId);
                    
                    if (p1Socket) p1Socket.join(roomId);
                    if (p2Socket) p2Socket.join(roomId);

                    activeRooms.set(roomId, {
                        player1: player1.userId,
                        player2: player2.userId,
                        problemId: randomProblem._id,
                        matchId: newMatch._id
                    });

                    // Emit match found
                    io.to(roomId).emit("matchFound", {
                        roomId,
                        matchId: newMatch._id,
                        problemId: randomProblem._id,
                        players: [
                            { userId: player1.userId, name: `${player1.firstName} ${player1.lastName}` },
                            { userId: player2.userId, name: `${player2.firstName} ${player2.lastName}` }
                        ]
                    });

                    console.log(`Match started in ${roomId} between ${player1.firstName} and ${player2.firstName}`);

                } catch (error) {
                    console.error("Matchmaking error:", error);
                    // Put them back in queue if error
                    waitingQueue.push(player1, player2);
                }
            }
        });

        socket.on("leaveQueue", () => {
            const userObj = socketUsers.get(socket.id);
            if (userObj) {
                waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
                console.log(`User ${userObj.firstName} left queue.`);
            }
        });

        socket.on("typing", (data) => {
            // Emits to the room that a player is typing
            const { roomId, userId } = data;
            socket.to(roomId).emit("opponentTyping", { userId });
        });

        socket.on("disconnect", async () => {
            console.log("Client disconnected:", socket.id);
            const userObj = socketUsers.get(socket.id);
            if (userObj) {
                // Remove from queue if they were in it
                waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
                
                // If they were in a match, forfeit the match
                for (let [roomId, room] of activeRooms.entries()) {
                    if (room.player1 === userObj.userId || room.player2 === userObj.userId) {
                        const winnerId = room.player1 === userObj.userId ? room.player2 : room.player1;
                        
                        // Notify opponent
                        io.to(roomId).emit("opponentDisconnected", { 
                            message: "Opponent disconnected. You win by default!",
                            winner: winnerId
                        });

                        // Update match status
                        try {
                            await Match.findByIdAndUpdate(room.matchId, {
                                status: 'forfeited',
                                winner: winnerId
                            });
                        } catch (err) {
                            console.error("Error updating forfeited match", err);
                        }

                        activeRooms.delete(roomId);
                        break;
                    }
                }
                socketUsers.delete(socket.id);
            }
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
