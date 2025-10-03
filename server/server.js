const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { connectDB } = require("./app"); // MongoDB connection
const userService = require("./services/users");
const groupService = require("./services/groups");
const authGuard = require("./authGuard");
const channelRoutes = require("./routes/channels");
const groupRoutes = require("./routes/groups");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use("/api/groups", groupRoutes);
app.use("/api/channels", channelRoutes);
// ---------------------------
// Auth
// ---------------------------

// Login
app.post("/api/auth", async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getUserByEmail(email);

  if (user && user.password === password) {
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles || ["USER"]
    };
    return res.json({ valid: true, ...req.session.user });
  }
  return res.json({ valid: false });
});

// Get current user
app.get("/api/user/current", authGuard, (req, res) => {
  res.json(req.session.user);
});

// Logout
app.post("/api/logout", authGuard, (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

// ---------------------------
// Users
// ---------------------------

app.get("/api/users", authGuard, async (req, res) => {
  const users = await userService.getUsers();
  const safeUsers = users.map(u => ({
    _id: u._id,
    username: u.username,
    email: u.email,
    roles: u.roles
  }));
  res.json(safeUsers);
});

// ---------------------------
// Registration
// ---------------------------
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // Create new user (roles default to ["USER"], groups default to empty)
    const newUser = {
      username,
      email,
      password,          // In production, hash this!
      roles: ["USER"],
      groups: []
    };

    // Save to DB
    const result = await userService.addUser(newUser);

    // Auto-login: set session
    req.session.user = {
      _id: result.insertedId.toString(),
      username,
      email,
      roles: ["USER"],
      groups: []
    };

    // Return success
    res.json({ success: true, _id: result.insertedId, username, email, roles: ["USER"] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ---------------------------
// Start
// ---------------------------
connectDB().then(() => {
  app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
}).catch(err => console.error("Failed to connect to DB:", err));
