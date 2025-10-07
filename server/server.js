const express = require("express");
const cors = require("cors");
const session = require("express-session");
const http = require("http");
const { connectDB } = require("./app"); // MongoDB connection
const userService = require("./services/users");
const authGuard = require("./authGuard");
const channelRoutes = require("./routes/channels");
const groupRoutes = require("./routes/groups");
const initSockets = require("./sockets"); // sockets.js exports function(io)

const app = express();

// ---------------------------
// Session Middleware
// ---------------------------
const sessionMiddleware = session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
});

// ---------------------------
// Middleware
// ---------------------------
app.use(cors({ origin: "http://localhost:4200", credentials: true }));
app.use(express.json());
app.use(sessionMiddleware);

// ---------------------------
// Routes
// ---------------------------
app.use("/api/groups", groupRoutes);
app.use("/api/channels", channelRoutes);

// ---------------------------
// Auth
// ---------------------------
app.post("/api/auth", async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getUserByEmail(email);

  if (user && user.password === password) {
    req.session.user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      roles: user.roles || ["USER"]
    };
    return res.json({ valid: true, ...req.session.user });
  }
  return res.status(401).json({ valid: false, message: "Invalid credentials" });
});

app.get("/api/user/current", authGuard, (req, res) => res.json(req.session.user));
app.post("/api/logout", authGuard, (req, res) => req.session.destroy(() => res.json({ message: "Logged out" })));

// ---------------------------
// Users
// ---------------------------
app.get("/api/users", authGuard, async (req, res) => {
  const users = await userService.getUsers();
  res.json(users.map(u => ({
    _id: u._id.toString(),
    username: u.username,
    email: u.email,
    roles: u.roles
  })));
});

// ---------------------------
// Registration
// ---------------------------
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success: false, message: "Please fill all fields" });

    if (await userService.getUserByEmail(email)) return res.status(400).json({ success: false, message: "Email in use" });

    const newUser = { username, email, password, roles: ["USER"], groups: [] };
    const result = await userService.addUser(newUser);

    req.session.user = {
      _id: result.insertedId.toString(),
      username,
      email,
      roles: ["USER"],
      groups: []
    };

    res.json({ success: true, _id: result.insertedId, username, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------------
// Start Server & Socket.io
// ---------------------------
connectDB().then(() => {
  const server = http.createServer(app);
  const { Server } = require("socket.io");
  const io = new Server(server, {
    cors: { origin: "http://localhost:4200", methods: ["GET","POST"], credentials: true }
  });

  io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
  initSockets(io, sessionMiddleware);

  server.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
}).catch(err => console.error("DB connection failed:", err));
