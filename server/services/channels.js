const { getDb } = require("../app");
const { ObjectId } = require("mongodb");

async function createChannel(groupId, name, description) {
  const db = getDb();
  const channel = {
    name,
    description,
    groupId: new ObjectId(groupId),
  };
  return db.collection("channels").insertOne(channel);
}

async function getChannelsByGroup(groupId) {
  const db = getDb();
  return db.collection("channels")
    .find({ groupId: new ObjectId(groupId) })
    .toArray();
}

async function deleteChannel(channelId) {
  const db = getDb();
  return db.collection("channels").deleteOne({ _id: new ObjectId(channelId) });
}

module.exports = {
  createChannel,
  getChannelsByGroup,
  deleteChannel,
};
