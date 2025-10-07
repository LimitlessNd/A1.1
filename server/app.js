const { MongoClient } = require('mongodb');

let db;

async function connectDB() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  db = client.db('mydb_app'); 
  console.log('MongoDB connected to mydb_app');
  return db;
}

function getDb() {
  if (!db) throw new Error('DB not connected');
  return db;
}

module.exports = { connectDB, getDb };
