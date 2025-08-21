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

app.listen(3000, () => {
    console.log('✅ Server running on http://localhost:3000');
});
