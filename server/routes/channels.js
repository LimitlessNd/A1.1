// routes/channels.js
const express = require("express");
const router = express.Router();
const authGuard = require("../authGuard");
const channelService = require("../services/channels");

// Get channels for a group
router.get("/:groupId", authGuard, async (req, res) => {
  try {
    const channels = await channelService.getChannelsByGroup(req.params.groupId);
    res.json(channels);
  } catch (err) {
    console.error("Error fetching channels:", err);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Create a channel
router.post("/:groupId", authGuard, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await channelService.createChannel(req.params.groupId, name, description);
    res.json({ message: "Channel created", _id: result.insertedId });
  } catch (err) {
    console.error("Error creating channel:", err);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// Delete a channel
router.delete("/:channelId", authGuard, async (req, res) => {
  try {
    await channelService.deleteChannel(req.params.channelId);
    res.json({ message: "Channel deleted" });
  } catch (err) {
    console.error("Error deleting channel:", err);
    res.status(500).json({ error: "Failed to delete channel" });
  }
});

module.exports = router;
