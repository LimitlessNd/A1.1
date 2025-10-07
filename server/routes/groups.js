const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authGuard = require("../authGuard");
const groupService = require("../services/groups");
const { getDb } = require("../app");

// Get all groups - SUPER_ADMIN sees all, normal users see their own
router.get("/", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    let groups;

    if (user.roles.includes("SUPER_ADMIN")) {
      groups = await groupService.getGroups(); // all groups
    } else {
      groups = await groupService.getGroupsForUser(user._id);
    }

    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// Get a single group by ID
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

// Create a new group
router.post("/", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const group = req.body;

    if (!group.groupAdmins) group.groupAdmins = [user._id];
    if (!group.members) group.members = [user._id];

    // Create default channels if none provided
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

// Update group details
router.put("/:id", authGuard, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;

    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);

    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only SUPER_ADMIN or group admin can update
    if (!group.groupAdmins.includes(user._id) && !user.roles.includes("SUPER_ADMIN")) {
      return res.status(403).json({ error: "You do not have permission to update this group" });
    }

    await groupService.updateGroup(req.params.id, updates);
    res.json({ message: "Group updated" });
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ error: "Failed to update group" });
  }
});

// Delete a group
router.delete("/:id", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);

    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only SUPER_ADMIN or group admin can delete
    if (!group.groupAdmins.includes(user._id) && !user.roles.includes("SUPER_ADMIN")) {
      return res.status(403).json({ error: "You do not have permission to delete this group" });
    }

    await groupService.deleteGroup(req.params.id);
    res.json({ message: "Group deleted" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

// Leave group
router.put("/:id/leave", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);

    if (!group) return res.status(404).json({ error: "Group not found" });

    // Group admins cannot leave unless SUPER_ADMIN
    if (group.groupAdmins.includes(user._id) && !user.roles.includes("SUPER_ADMIN")) {
      return res.status(403).json({ error: "Group admins cannot leave the group" });
    }

    await groupService.leaveGroup(req.params.id, user._id);
    res.json({ message: "You have left the group" });
  } catch (err) {
    console.error("Error leaving group:", err);
    res.status(500).json({ error: "Failed to leave group" });
  }
});

// Add a member to a group
router.put("/:id/add-member", authGuard, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId provided" });

    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only SUPER_ADMIN or group admin can add members
    if (!group.groupAdmins.includes(user._id) && !user.roles.includes("SUPER_ADMIN")) {
      return res.status(403).json({ error: "You do not have permission to add members" });
    }

    await groupService.addMemberToGroup(req.params.id, userId);
    res.json({ message: "User added to group" });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

// Remove a member from a group
router.put("/:id/remove-member", authGuard, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId provided" });

    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only SUPER_ADMIN or group admin can remove members
    if (!group.groupAdmins.includes(user._id) && !user.roles.includes("SUPER_ADMIN")) {
      return res.status(403).json({ error: "You do not have permission to remove members" });
    }

    await groupService.removeMemberFromGroup(req.params.id, userId);
    res.json({ message: "User removed from group" });
  } catch (err) {
    console.error("Error removing member:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// Promote a member to admin
router.put("/:id/add-admin", authGuard, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId provided" });

    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only SUPER_ADMIN or group admin can promote
    if (!group.groupAdmins.includes(user._id) && !user.roles.includes("SUPER_ADMIN")) {
      return res.status(403).json({ error: "You do not have permission to add admins" });
    }

    await groupService.makeGroupAdmin(req.params.id, userId);
    res.json({ message: "User promoted to admin" });
  } catch (err) {
    console.error("Error adding admin:", err);
    res.status(500).json({ error: "Failed to add admin" });
  }
});

// Add a channel to a group
router.put("/:groupId/add-channel", authGuard, async (req, res) => {
  try {
    const db = getDb();
    const { name, description } = req.body;
    const groupId = req.params.groupId;

    const group = await db.collection("groups").findOne({ _id: new ObjectId(groupId) });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const newChannel = { _id: new ObjectId(), name, description };
    await db.collection("groups").updateOne(
      { _id: new ObjectId(groupId) },
      { $push: { channels: newChannel } }
    );

    const updatedGroup = await db.collection("groups").findOne({ _id: new ObjectId(groupId) });
    res.json(updatedGroup); // send updated group back to Angular
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add channel" });
  }
});

module.exports = router;
