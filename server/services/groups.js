const { getDb } = require("../app"); 
const { ObjectId } = require("mongodb"); 
// Get all groups
async function getGroups() {
  const db = getDb();
  return db.collection("groups").find().toArray(); // return all groups
}

// Get a single group by ID
async function getGroupById(id) {
  const db = getDb();
  return db.collection("groups").findOne({ _id: new ObjectId(id) });
}

// Add a new group
async function addGroup(group) {
  const db = getDb();
  return db.collection("groups").insertOne(group);
}

// Update a group by ID
async function updateGroup(id, updates) {
  const db = getDb();
  return db.collection("groups").updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
}

// Delete a group by ID
async function deleteGroup(id) {
  const db = getDb();
  return db.collection("groups").deleteOne({ _id: new ObjectId(id) });
}

// Get all groups where a user is a member
async function getGroupsForUser(userId) {
  const db = getDb();
  return db.collection("groups").find({ members: userId }).toArray();
}

// Check if a user is a group admin
async function isGroupAdmin(groupId, userId) {
  const db = getDb();
  const group = await db.collection("groups").findOne({ _id: new ObjectId(groupId) });
  return group && group.groupAdmins.includes(userId);
}

// User leaves a group
async function leaveGroup(groupId, userId) {
  const db = getDb();

  // Remove user from group's members
  await db.collection('groups').updateOne(
    { _id: new ObjectId(groupId) },
    { $pull: { members: userId } }
  );

  // Remove group from user's groups
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { groups: groupId } }
  );

  return { message: "User has left the group" };
}

// Add a member to a group
async function addMemberToGroup(groupId, userId) {
  const db = getDb();

  // Add userId to group members if not already present
  await db.collection('groups').updateOne(
    { _id: new ObjectId(groupId), members: { $ne: userId } },
    { $push: { members: userId } }
  );

  // Add groupId to user's groups array if not already present
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId), groups: { $ne: groupId } },
    { $push: { groups: groupId } }
  );

  return { message: "User added to group" };
}

// Remove a member from a group
async function removeMemberFromGroup(groupId, userId) {
  const db = getDb();
  const groupObjectId = new ObjectId(groupId);
  const userObjectId = new ObjectId(userId);

  // Remove user from group's members
  await db.collection('groups').updateOne(
    { _id: groupObjectId },
    { $pull: { members: userId } }
  );

  // Remove group from user's groups
  await db.collection('users').updateOne(
    { _id: userObjectId },
    { $pull: { groups: groupObjectId } }
  );

  return { message: "User removed from group" };
}

// Promote a user to group admin
async function makeGroupAdmin(groupId, userId) {
  const db = getDb();
  const groupObjectId = new ObjectId(groupId);

  // Add userId to groupAdmins if not already present
  await db.collection('groups').updateOne(
    { _id: groupObjectId, groupAdmins: { $ne: userId } },
    { $push: { groupAdmins: userId } }
  );

  return { message: "User promoted to admin" };
}

module.exports = {
  getGroups,
  getGroupById,
  addGroup,
  updateGroup,
  deleteGroup,
  getGroupsForUser,
  isGroupAdmin,
  leaveGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  makeGroupAdmin
};
