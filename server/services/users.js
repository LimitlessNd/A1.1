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

// Update existing user with optional profile image
async function updateUser(user) {
  const db = getDb();
  const { _id, username, email, password, roles, profileImage } = user;

  const updateData = { username, email, password, roles };
  if (profileImage) updateData.profileImage = profileImage;

  return db.collection("users").updateOne(
    { _id: new ObjectId(_id) },
    { $set: updateData }
  );
}

module.exports = { getUsers, getUserByEmail, getUserById, addUser, updateUser };
