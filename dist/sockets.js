"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const message_1 = __importDefault(require("./models/message"));
const connectedUsers = {}; // Maps userID to socket.id
const initSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        // User joins and identifies themselves
        socket.on("join", (userID) => {
            connectedUsers[userID] = socket.id;
            console.log(`User ${userID} joined with socket ID ${socket.id}`);
        });
        // Handle message sending
        socket.on("send_message", async (data) => {
            const { fromUserID, toUserID, content } = data;
            // Save to DB
            await message_1.default.create({ fromUserID, toUserID, content });
            // Emit to recipient if online
            const targetSocket = connectedUsers[toUserID];
            if (targetSocket) {
                io.to(targetSocket).emit("receive_message", {
                    fromUserID,
                    content,
                });
            }
        });
        // Handle disconnect
        socket.on("disconnect", () => {
            for (const userID in connectedUsers) {
                if (connectedUsers[userID] === socket.id) {
                    delete connectedUsers[userID];
                    break;
                }
            }
            console.log("User disconnected:", socket.id);
        });
    });
};
exports.initSocket = initSocket;
