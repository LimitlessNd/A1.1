const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// User class
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

// Hardcoded users
const users = [
    new User('u1', 'super', 'super@test.com', '123', ['SUPER_ADMIN']),
    new User('u2', 'groupAdmin', 'admin@test.com', 'admin123', ['GROUP_ADMIN']),
    new User('u3', 'John', '1@test.com', '123', ['USER']),
    new User('u4', 'Mary', '2@test.com', 'abc', ['USER']),
    new User('u5', 'Steve', '3@test.com', 'pass', ['USER'])
];

// Login route
app.post('/api/auth', (req, res) => {
    const { email, password } = req.body;
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
        return res.json({
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
            role: foundUser.roles[0],
            valid: true
        });
    }

    return res.json({ valid: false });
});

// Get all users
app.get('/api/users', (req, res) => {
    // return only id and username
    const userList = users.map(u => ({ id: u.id, username: u.username }));
    res.json(userList);
});

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const exists = users.find(u => u.email === email || u.username === username);
    if (exists) {
        return res.status(400).json({ message: 'Username or email already exists.' });
    }

    const newId = 'u' + (users.length + 1);
    const newUser = new User(newId, username, email, password);
    users.push(newUser);

    return res.json({
        message: 'User registered successfully!',
        user: { id: newId, username, email }
    });
});

app.listen(3000, () => {
    console.log('✅ Server running on http://localhost:3000');
});
