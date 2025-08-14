const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// User class
class User {
    constructor(username, age, email, password, valid = false) {
        this.username = username;
        this.age = age;
        this.email = email;
        this.password = password;
        this.valid = valid;
    }
}

// Dummy users
const users = [
    new User('John', 25, '1@test.com', '123'),
    new User('Mary', 30, '2@test.com', 'abc'),
    new User('Steve', 28, '3@test.com', 'pass')
];

// Login route
app.post('/api/auth', (req, res) => {
    const { email, password } = req.body;
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
        return res.json({
            username: foundUser.username,
            age: foundUser.age,
            email: foundUser.email,
            valid: true
        });
    }
    return res.json({ valid: false });
});

// Start
app.listen(3000, () => {
    console.log('✅ Server running on http://localhost:3000');
});
