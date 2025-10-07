const { insertMessage, getMessages } = require("./services/messages");

module.exports = (io, sessionMiddleware) => {
  // Share Express session with Socket.io
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, () => {
      const session = socket.request.session;
      if (!session || !session.user) {
        console.warn("⚠️ No session found for socket", socket.id);
        return next(new Error("No session found"));
      }
      next();
    });
  });

  io.on("connection", async (socket) => {
    const user = socket.request.session.user;
    console.log("User connected:", user.username, socket.id);

    socket.currentChannel = null;

    // ---------------------------
    // Join a channel
    // ---------------------------
    socket.on("joinChannel", async (channelId) => {
      if (!channelId) return;

      // Leave previous channel if any
      if (socket.currentChannel) {
        socket.leave(socket.currentChannel);
        io.to(socket.currentChannel).emit("message", {
          _id: null,
          channelId: socket.currentChannel,
          username: "System",
          message: `${user.username} left the chat`,
          createdAt: new Date(),
          system: true
        });
      }

      socket.join(channelId);
      socket.currentChannel = channelId;

      // Send chat history first
      try {
        const history = await getMessages(channelId);
        socket.emit("history", history);
      } catch (err) {
        console.error("Failed to load history:", err);
        socket.emit("history", []);
      }

      // Broadcast join message after history is sent
      io.to(channelId).emit("message", {
        _id: null,
        channelId,
        username: "System",
        message: `${user.username} joined the chat`,
        createdAt: new Date(),
        system: true
      });
    });

    // ---------------------------
    // Leave a channel
    // ---------------------------
    socket.on("leaveChannel", () => {
      if (socket.currentChannel) {
        io.to(socket.currentChannel).emit("message", {
          _id: null,
          channelId: socket.currentChannel,
          username: "System",
          message: `${user.username} left the chat`,
          createdAt: new Date(),
          system: true
        });

        socket.leave(socket.currentChannel);
        socket.currentChannel = null;
      }
    });

    // ---------------------------
    // Send a message
    // ---------------------------
    socket.on("sendMessage", async (data) => {
      const { channelId, message } = data;
      if (!channelId || !message) return;

      try {
        const saved = await insertMessage(channelId, user.username, message);
        const fullMessage = {
          _id: saved.insertedId,
          channelId,
          username: user.username,
          message,
          createdAt: new Date(),
        };
        io.to(channelId).emit("message", fullMessage);
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    });

    // ---------------------------
    // Disconnect
    // ---------------------------
    socket.on("disconnect", () => {
      if (socket.currentChannel) {
        io.to(socket.currentChannel).emit("message", {
          _id: null,
          channelId: socket.currentChannel,
          username: "System",
          message: `${user.username} left the chat`,
          createdAt: new Date(),
          system: true
        });
      }
      console.log("User disconnected:", user.username, socket.id);
    });
  });
};
