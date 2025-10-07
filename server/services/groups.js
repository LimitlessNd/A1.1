const { getDb } = require("../app");
const { ObjectId } = require("mongodb");

async function getGroups() {
  const db = getDb();
  return db.collection("groups").find().toArray();
}

async function getGroupById(id) {
  const db = getDb();
  return db.collection("groups").findOne({ _id: new ObjectId(id) });
}

async function addGroup(group) {
  const db = getDb();
  return db.collection("groups").insertOne(group);
}

async function updateGroup(id, updates) {
  const db = getDb();
  return db.collection("groups").updateOne({ _id: new ObjectId(id) }, { $set: updates });
}

async function deleteGroup(id) {
  const db = getDb();
  return db.collection("groups").deleteOne({ _id: new ObjectId(id) });
}

// Get all groups where a user is a member
async function getGroupsForUser(userId) {
  const db = getDb();
  return db.collection("groups").find({ members: userId }).toArray();
}

// Check if a user is admin of a group
async function isGroupAdmin(groupId, userId) {
  const db = getDb();
  const group = await db.collection("groups").findOne({ _id: new ObjectId(groupId) });
  return group && group.groupAdmins.includes(userId);
}

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

async function addMemberToGroup(groupId, userId) {
  const db = getDb();

  // Add userId to group members if not already there
  await db.collection('groups').updateOne(
    { _id: new ObjectId(groupId), members: { $ne: userId } },
    { $push: { members: userId } }
  );

  // Add groupId to user's groups array if not already there
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId), groups: { $ne: groupId } },
    { $push: { groups: groupId } }
  );

  return { message: "User added to group" };
}

async function removeMemberFromGroup(groupId, userId) {
  const db = getDb();
  const groupObjectId = new ObjectId(groupId);
  const userObjectId = new ObjectId(userId);

  // Remove from group
  await db.collection('groups').updateOne(
    { _id: groupObjectId },
    { $pull: { members: userId } }
  );

  // Remove group from user
  await db.collection('users').updateOne(
    { _id: userObjectId },
    { $pull: { groups: groupObjectId } }
  );

  return { message: "User removed from group" };
}
async function makeGroupAdmin(groupId, userId) {
  const db = getDb();
  const groupObjectId = new ObjectId(groupId);

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
