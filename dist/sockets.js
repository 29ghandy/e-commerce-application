"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initChatSocket = void 0;
const agents = [];
const activeChats = {}; // customer → agent
const initChatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("Connected:", socket.id);
        socket.on("agent-join", ({ userId }) => {
            agents.push({ socketId: socket.id, userId, busy: false });
            console.log(`Agent ${userId} joined`);
        });
        socket.on("customer-join", ({ userId }) => {
            const agent = agents.find((a) => !a.busy);
            if (!agent) {
                socket.emit("no-agents");
                return;
            }
            agent.busy = true;
            activeChats[socket.id] = agent.socketId;
            activeChats[agent.socketId] = socket.id;
            io.to(socket.id).emit("agent-connected", { agentId: agent.userId });
            io.to(agent.socketId).emit("customer-connected", { customerId: userId });
        });
        socket.on("send-message", ({ message }) => {
            const peer = activeChats[socket.id];
            if (peer)
                io.to(peer).emit("receive-message", { message });
        });
        socket.on("disconnect", () => {
            const peer = activeChats[socket.id];
            if (peer) {
                io.to(peer).emit("peer-disconnected");
                delete activeChats[peer];
                const agent = agents.find((a) => a.socketId === peer);
                if (agent)
                    agent.busy = false;
            }
            delete activeChats[socket.id];
            const i = agents.findIndex((a) => a.socketId === socket.id);
            if (i !== -1)
                agents.splice(i, 1);
        });
    });
};
exports.initChatSocket = initChatSocket;
