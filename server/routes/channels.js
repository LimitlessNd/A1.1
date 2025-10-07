const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authGuard = require("../authGuard");
const { getDb } = require("../app"); 

// Get all channels for a group
router.get("/:groupId", authGuard, async (req, res) => {
  try {
    const db = getDb();

    // Fetch the group document by its ID
    const group = await db.collection("groups").findOne({
      _id: new ObjectId(req.params.groupId),
    });

    // Return the channels array or empty array if none exist
    res.json(group?.channels || []);
  } catch (err) {
    console.error("Error fetching channels:", err);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Delete a specific channel
router.delete("/:channelId", authGuard, async (req, res) => {
  try {
    const db = getDb();
    const channelId = req.params.channelId;

    // Remove the channel from any group that contains it
    const result = await db.collection("groups").updateOne(
      { "channels._id": new ObjectId(channelId) },
      { $pull: { channels: { _id: new ObjectId(channelId) } } }
    );

    // If no document was modified, the channel was not found
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Successfully deleted channel
    res.json({ message: "Channel deleted" });
  } catch (err) {
    console.error("Error deleting channel:", err);
    res.status(500).json({ error: "Failed to delete channel" });
  }
});

module.exports = router;
