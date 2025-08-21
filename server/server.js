const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// User class
class User {
    constructor(username, age, email, password, roles = ['USER'], groups = [], valid = false) {
        this.username = username;
        this.age = age;
        this.email = email;
        this.password = password;
        this.roles = roles;     // ['SUPER_ADMIN', 'GROUP_ADMIN', 'USER']
        this.groups = groups;   // array of group IDs
        this.valid = valid;     // for login response
    }
}

// Dummy users including Super Admin
const users = [
    new User('super', 30, 'super@test.com', '123', ['SUPER_ADMIN']),
    new User('groupAdmin', 28, 'admin@test.com', 'admin123', ['GROUP_ADMIN']),
    new User('John', 25, '1@test.com', '123'),
    new User('Mary', 30, '2@test.com', 'abc'),
    new User('Steve', 28, '3@test.com', 'pass')
];

// Login route
app.post('/api/auth', (req, res) => {
    const { email, password } = req.body;
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
        // Send a single role for simplicity
        return res.json({
            username: foundUser.username,
            age: foundUser.age,
            email: foundUser.email,
            role: foundUser.roles[0],  // take the first role
            groups: foundUser.groups,
            valid: true
        });
    }

    return res.json({ valid: false });
});

// Middleware to protect routes based on role
function requireRole(role) {
    return (req, res, next) => {
        const { email } = req.body; // assume email passed in request
        const user = users.find(u => u.email === email);
        if (!user || !user.roles.includes(role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient role' });
        }
        next();
    };
}

// Example protected route
app.post('/api/admin-action', requireRole('SUPER_ADMIN'), (req, res) => {
    res.json({ message: 'You are a Super Admin!' });
});

// Start server
app.listen(3000, () => {
    console.log('✅ Server running on http://localhost:3000');
});
