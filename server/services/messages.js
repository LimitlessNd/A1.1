const { getDb } = require("../app"); 
const { ObjectId } = require("mongodb"); 

// CREATE - add a message to a channel
async function insertMessage(channelId, username, message) {
  if (typeof channelId !== "string") {
    throw new Error("Invalid channelId for MongoDB"); // validate channelId
  }

  const db = getDb(); // get MongoDB connection
  const doc = {
    channelId,      // store as string like "c1"
    username,       // sender's username
    message,        // message content
    createdAt: new Date(), // timestamp
  };

  return db.collection("messages").insertOne(doc); // insert into "messages" collection
}

// READ - get all messages for a channel
async function getMessages(channelId) {
  if (typeof channelId !== "string") {
    throw new Error("Invalid channelId for MongoDB"); // validate channelId
  }

  const db = getDb(); // get MongoDB connection
  return db
    .collection("messages")
    .find({ channelId })      // find messages for this channel
    .sort({ createdAt: 1 })   // sort by creation time ascending
    .toArray();               // return as array
}

module.exports = { insertMessage, getMessages };
