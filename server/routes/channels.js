const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authGuard = require("../authGuard");
const { getDb } = require("../app"); // make sure getDb is exported from app.js

// Get channels for a group
router.get("/:groupId", authGuard, async (req, res) => {
  try {
    const db = getDb();
    const group = await db.collection("groups").findOne({ _id: new ObjectId(req.params.groupId) });
    res.json(group?.channels || []);
  } catch (err) {
    console.error("Error fetching channels:", err);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Delete a channel
router.delete("/:channelId", authGuard, async (req, res) => {
  try {
    const db = getDb();
    const channelId = req.params.channelId;

    const result = await db.collection("groups").updateOne(
      { "channels._id": new ObjectId(channelId) },
      { $pull: { channels: { _id: new ObjectId(channelId) } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.json({ message: "Channel deleted" });
  } catch (err) {
    console.error("Error deleting channel:", err);
    res.status(500).json({ error: "Failed to delete channel" });
  }
});

module.exports = router;
