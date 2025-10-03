// services/users.js
const { getDb } = require("../app");
const { ObjectId } = require("mongodb");

// Get all users
async function getUsers() {
  const db = getDb();
  return db.collection("users").find().toArray();
}

// Get user by email
async function getUserByEmail(email) {
  const db = getDb();
  return db.collection("users").findOne({ email });
}

// Get user by ID
async function getUserById(id) {
  const db = getDb();
  return db.collection("users").findOne({ _id: new ObjectId(id) });
}

// Add a new user
async function addUser(user) {
  const db = getDb();
  return db.collection("users").insertOne(user);
}

// Update existing user
async function updateUser(user) {
  const db = getDb();
  const { _id, username, email, password, roles } = user;
  return db.collection("users").updateOne(
    { _id: new ObjectId(_id) },
    { $set: { username, email, password, roles } }
  );
}

module.exports = { getUsers, getUserByEmail, getUserById, addUser, updateUser };
