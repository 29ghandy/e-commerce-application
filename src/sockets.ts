import { Server } from "socket.io";
import Message from "./models/message";

const connectedUsers: Record<number, string> = {}; // Maps userID to socket.id

export const initSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins and identifies themselves
    socket.on("join", (userID: number) => {
      connectedUsers[userID] = socket.id;
      console.log(`User ${userID} joined with socket ID ${socket.id}`);
    });

    // Handle message sending
    socket.on("send_message", async (data: {
      fromUserID: number;
      toUserID: number;
      content: string;
    }) => {
      const { fromUserID, toUserID, content } = data;

      // Save to DB
      await Message.create({ fromUserID, toUserID, content });

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
