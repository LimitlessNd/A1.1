const express = require("express");
const router = express.Router();
const authGuard = require("../authGuard");
const groupService = require("../services/groups");

// Get all groups for current user
router.get("/", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const groups = await groupService.getGroupsForUser(user._id);
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// Create a group
router.post("/", authGuard, async (req, res) => {
  try {
    const group = req.body;
    const user = req.session.user;

    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Ensure default admins and members
    if (!group.groupAdmins) group.groupAdmins = [user._id];
    if (!group.members) group.members = [user._id];

    // Add default channels if not provided
    if (!group.channels) {
      group.channels = [
        { id: 'c1', name: 'General', description: 'General discussion' },
        { id: 'c2', name: 'Random', description: 'Random topics' }
      ];
    }

    const result = await groupService.addGroup(group);
    res.json({ message: "Group created", _id: result.insertedId });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// Update a group
router.put("/:id", authGuard, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id; // <-- remove _id so MongoDB won't try to change it

    const result = await groupService.updateGroup(req.params.id, updates);
    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Group not found" });

    res.json({ message: "Group updated" });
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ error: "Failed to update group" });
  }
});

// Delete a group
router.delete("/:id", authGuard, async (req, res) => {
  try {
    await groupService.deleteGroup(req.params.id);
    res.json({ message: "Group deleted" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

// Leave a group (remove self from members)
router.put("/:id/leave", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const groupId = req.params.id;

    const group = await groupService.getGroupById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Prevent admins from leaving
    if (group.groupAdmins.includes(user._id)) {
      return res
        .status(403)
        .json({ error: "Group admins cannot leave the group" });
    }

    // Use service function
    await groupService.leaveGroup(groupId, user._id);
    res.json({ message: "You have left the group" });
  } catch (err) {
    console.error("Error leaving group:", err);
    res.status(500).json({ error: "Failed to leave group" });
  }
});

router.put("/:id/add-member", authGuard, async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.id;

    if (!userId) return res.status(400).json({ error: "No userId provided" });

    await groupService.addMemberToGroup(groupId, userId); // updates both group.members & user.groups
    res.json({ message: "User added to group" });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

router.put("/:id/remove-member", authGuard, async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.id;

    if (!userId) return res.status(400).json({ error: "No userId provided" });

    await groupService.removeMemberFromGroup(groupId, userId);
    res.json({ message: "User removed from group" });
  } catch (err) {
    console.error("Error removing member from group:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// routes/groups.js
router.put("/:groupId/add-channel", authGuard, async (req, res) => {
  try {
    const { name, description } = req.body;
    const groupId = req.params.groupId;
    const db = getDb();

    const updatedGroup = await db.collection("groups").findOneAndUpdate(
      { _id: new ObjectId(groupId) },
      { $push: { channels: { name, description } } },
      { returnDocument: "after" } // returns the updated document
    );

    res.json(updatedGroup.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add channel" });
  }
});
// GET /api/groups/:id → fetch a single group
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
module.exports = router;
