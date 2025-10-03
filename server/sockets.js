const { Server } = require("socket.io");
const { insertMessage, getMessages } = require("./services/messages");

module.exports = (server, sessionMiddleware) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:4200", methods: ["GET","POST"], credentials: true }
  });

  // Wrap session middleware for each socket
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, () => {
      if (!socket.request.session || !socket.request.session.user) {
        return next(new Error("No session or user found"));
      }
      next();
    });
  });

  io.on("connection", (socket) => {
    // now each socket gets its own user
    const session = socket.request.session;
    const username = session.user.username;

    console.log("User connected:", username, socket.id);

    socket.on("joinChannel", async ({ channelId }) => {
      socket.join(channelId);

      const history = await getMessages(channelId);
      socket.emit("history", history);

      io.to(channelId).emit("chatMessage", {
        system: true,
        message: `${username} joined the channel`
      });
    });

    socket.on("chatMessage", async ({ channelId, message }) => {
      if (!message) return;

      // Save to DB with correct username from session
      await insertMessage(channelId, username, message);

      io.to(channelId).emit("chatMessage", { username, message, system: false });
    });

    socket.on("leaveChannel", ({ channelId }) => {
      socket.leave(channelId);
      io.to(channelId).emit("chatMessage", {
        system: true,
        message: `${username} left the channel`
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", username, socket.id);
    });
  });
};
