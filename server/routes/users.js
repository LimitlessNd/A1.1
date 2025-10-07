// server/routes/users.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../app'); 
const { ObjectId } = require('mongodb'); 

// Update user endpoint
router.put('/', async (req, res) => {
  try {
    const db = getDb();
    const { _id, username, email } = req.body;

    // Ensure user ID is provided
    if (!_id) return res.status(400).send({ error: 'User ID is required' });

    // Update the user in MongoDB
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { username, email } }
    );

    // If no document matched, user not found
    if (result.matchedCount === 0) return res.status(404).send({ error: 'User not found' });

    res.send({ success: true, message: 'User updated' });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;
