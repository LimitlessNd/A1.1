// server/routes/users.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../app'); // import your MongoDB connection

// Update user endpoint
router.put('/', async (req, res) => {
  try {
    const db = getDb();
    const { _id, username, email } = req.body;

    if (!_id) return res.status(400).send({ error: 'User ID is required' });

    const ObjectId = require('mongodb').ObjectId;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { username, email } }
    );

    if (result.matchedCount === 0) return res.status(404).send({ error: 'User not found' });

    res.send({ success: true, message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;
