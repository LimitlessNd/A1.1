const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authGuard = require("../authGuard");
const groupService = require("../services/groups");

// ---------------------------
// GET /api/groups
// ---------------------------
// SUPER_ADMIN sees all groups, normal users see their own
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

// ---------------------------
// GET single group
// ---------------------------
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

// ---------------------------
// CREATE group
// ---------------------------
router.post("/", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const group = req.body;

    if (!group.groupAdmins) group.groupAdmins = [user._id];
    if (!group.members) group.members = [user._id];

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

// ---------------------------
// UPDATE group
// ---------------------------
router.put("/:id", authGuard, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;

    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);

    if (!group) return res.status(404).json({ error: "Group not found" });

    // Allow SUPER_ADMIN or group admin to update
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

// ---------------------------
// DELETE group
// ---------------------------
router.delete("/:id", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);

    if (!group) return res.status(404).json({ error: "Group not found" });

    // Allow SUPER_ADMIN or group admin to delete
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

// ---------------------------
// LEAVE group
// ---------------------------
router.put("/:id/leave", authGuard, async (req, res) => {
  try {
    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);

    if (!group) return res.status(404).json({ error: "Group not found" });

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

// ---------------------------
// ADD member
// ---------------------------
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

// ---------------------------
// REMOVE member
// ---------------------------
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
// ---------------------------
// ADD admin
// ---------------------------
router.put("/:id/add-admin", authGuard, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "No userId provided" });

    const user = req.session.user;
    const group = await groupService.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // Only SUPER_ADMIN or group admin can add new admins
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

module.exports = router;
