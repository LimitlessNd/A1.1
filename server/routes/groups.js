const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const authGuard = require("../authGuard");
const groupService = require("../services/groups");
const { getDb } = require("../app");

// Get all groups for current user
router.get("/", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const groups = await groupService.getGroupsForUser(user._id);
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// Get single group
router.get("/:id", authGuard, async (req, res) => {
  try {
    const group = await groupService.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (err) {
    console.error("Error fetching group:", err);
    res.status(500).json({ error: "Failed to fetch group" });
  }
});

// Create group
router.post("/", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const group = req.body;

    if (!group.groupAdmins) group.groupAdmins = [user._id];
    if (!group.members) group.members = [user._id];

    // Assign default channels with MongoDB ObjectIds
    if (!group.channels) {
      group.channels = [
        { _id: new ObjectId(), name: "General", description: "General discussion" },
        { _id: new ObjectId(), name: "Random", description: "Random topics" },
      ];
    }

    const result = await groupService.addGroup(group);
    res.json({ message: "Group created", _id: result.insertedId });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// Update group
router.put("/:id", authGuard, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;
    const result = await groupService.updateGroup(req.params.id, updates);
    if (result.matchedCount === 0) return res.status(404).json({ error: "Group not found" });
    res.json({ message: "Group updated" });
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ error: "Failed to update group" });
  }
});

// Delete group
router.delete("/:id", authGuard, async (req, res) => {
  try {
    await groupService.deleteGroup(req.params.id);
    res.json({ message: "Group deleted" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

// Leave a group
router.put("/:id/leave", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.groupAdmins.includes(user._id)) {
      return res.status(403).json({ error: "Group admins cannot leave the group" });
    }

    await groupService.leaveGroup(req.params.id, user._id);
    res.json({ message: "You have left the group" });
  } catch (err) {
    console.error("Error leaving group:", err);
    res.status(500).json({ error: "Failed to leave group" });
  }
});

// Add member
router.put("/:id/add-member", authGuard, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId provided" });

    await groupService.addMemberToGroup(req.params.id, userId);
    res.json({ message: "User added to group" });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

// Remove member
router.put("/:id/remove-member", authGuard, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId provided" });

    await groupService.removeMemberFromGroup(req.params.id, userId);
    res.json({ message: "User removed from group" });
  } catch (err) {
    console.error("Error removing member:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// Add channel
router.put("/:id/add-channel", authGuard, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = getDb();

    const updatedGroup = await db.collection("groups").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $push: { channels: { _id: new ObjectId(), name, description } } },
      { returnDocument: "after" } // ensures updated document is returned
    );

    if (!updatedGroup.value) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(updatedGroup.value); // always send the updated group
  } catch (err) {
    console.error("Error adding channel:", err);
    res.status(500).json({ error: "Failed to add channel" });
  }
});

module.exports = router;
