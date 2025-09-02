const express = require('express');
const cors = require('cors');
const session = require('express-session');
const authGuard = require('./authGuard');

const app = express();

// ---------------------------
// Middleware
// ---------------------------
app.use(cors({
  origin: 'http://localhost:4200', // frontend origin
  credentials: true
}));
app.use(express.json());

// 🔐 Session setup
app.use(session({
  secret: 'super-secret-key', // change to a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true if using HTTPS
}));

// ---------------------------
// User Model
// ---------------------------
class User {
  constructor(id, username, email, password, roles = ['USER'], valid = false) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.valid = valid;
  }
}

// Hardcoded user database
const users = [
  new User('u1', 'super', 'super@test.com', '123', ['SUPER_ADMIN']),
  new User('u2', 'groupAdmin', 'admin@test.com', 'admin123', ['GROUP_ADMIN']),
  new User('u3', 'John', '1@test.com', '123', ['USER']),
  new User('u4', 'Mary', '2@test.com', 'abc', ['USER']),
  new User('u5', 'Steve', '3@test.com', 'pass', ['USER'])
];

// ---------------------------
// Routes
// ---------------------------

// Login route
app.post('/api/auth', (req, res) => {
  const { email, password } = req.body;
  const foundUser = users.find(u => u.email === email && u.password === password);

  if (foundUser) {
    // Save session info
    req.session.user = {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.roles[0]
    };
    return res.json({ ...req.session.user, valid: true });
  }

  // Invalid credentials
  return res.json({ valid: false });
});

// Protected route to get all users (only accessible if logged in)
app.get('/api/users', authGuard, (req, res) => {
  const userList = users.map(u => ({ id: u.id, username: u.username }));
  res.json(userList);
});

// Register new user
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;

  // Check for missing fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check if user/email already exists
  const exists = users.find(u => u.email === email || u.username === username);
  if (exists) {
    return res.status(400).json({ message: 'Username or email already exists.' });
  }

  // Create new user
  const newId = 'u' + (users.length + 1);
  const newUser = new User(newId, username, email, password);
  users.push(newUser);

  return res.json({
    message: 'User registered successfully!',
    user: { id: newId, username, email }
  });
});

// Logout route
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// ---------------------------
// Start server
// ---------------------------
app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
