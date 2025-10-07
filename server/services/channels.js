const { getDb } = require("../app"); // MongoDB connection
const { ObjectId } = require("mongodb"); // ObjectId for MongoDB documents

// Create a new channel for a group
async function createChannel(groupId, name, description) {
  const db = getDb();

  // Construct channel object
  const channel = {
    name,
    description,
    groupId: new ObjectId(groupId), // link channel to group
  };

  // Insert into channels collection
  return db.collection("channels").insertOne(channel);
}

// Get all channels for a specific group
async function getChannelsByGroup(groupId) {
  const db = getDb();

  // Find channels by groupId
  return db.collection("channels")
    .find({ groupId: new ObjectId(groupId) })
    .toArray();
}

// Delete a channel by its ID
async function deleteChannel(channelId) {
  const db = getDb();

  // Remove the channel document
  return db.collection("channels").deleteOne({ _id: new ObjectId(channelId) });
}

module.exports = {
  createChannel,
  getChannelsByGroup,
  deleteChannel,
};
