const { getDb } = require("../app");
const { ObjectId } = require("mongodb");

// CREATE - add a message
async function insertMessage(channelId, username, message) {
  if (typeof channelId !== "string") {
    throw new Error("Invalid channelId for MongoDB");
  }

  const db = getDb();
  const doc = {
    channelId,      // keep as string like "c1"
    username,
    message,
    createdAt: new Date(),
  };

  return db.collection("messages").insertOne(doc);
}

// READ - get messages for a channel
async function getMessages(channelId) {
  if (typeof channelId !== "string") {
    throw new Error("Invalid channelId for MongoDB");
  }

  const db = getDb();
  return db
    .collection("messages")
    .find({ channelId })
    .sort({ createdAt: 1 })
    .toArray();
}

module.exports = { insertMessage, getMessages };
