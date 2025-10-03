const { getDb } = require('../app');

async function insertMessage(channelId, username, message) {
  const db = getDb();
  await db.collection('messages').insertOne({
    channelId,
    username,
    message,
    createdAt: new Date()
  });
}

async function getMessages(channelId) {
  const db = getDb();
  return db.collection('messages')
    .find({ channelId })
    .sort({ createdAt: 1 })
    .toArray();
}

module.exports = { insertMessage, getMessages };
