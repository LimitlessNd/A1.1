const { getDb } = require("../app"); // MongoDB connection
const { ObjectId } = require("mongodb"); // ObjectId for MongoDB documents

// Get all users
async function getUsers() {
  const db = getDb(); // get MongoDB connection
  return db.collection("users").find().toArray(); // return all users
}

// Get user by email
async function getUserByEmail(email) {
  const db = getDb();
  return db.collection("users").findOne({ email }); // find user by email
}

// Get user by ID
async function getUserById(id) {
  const db = getDb();
  return db.collection("users").findOne({ _id: new ObjectId(id) }); // find user by _id
}

// Add a new user
async function addUser(user) {
  const db = getDb();
  return db.collection("users").insertOne(user); // insert new user document
}

// Update existing user 
async function updateUser(user) {
  const db = getDb();
  const { _id, username, email, password, roles } = user;

  const updateData = { username, email, password, roles }; // core fields

  return db.collection("users").updateOne(
    { _id: new ObjectId(_id) }, // match by _id
    { $set: updateData }        // update fields
  );
}

module.exports = { getUsers, getUserByEmail, getUserById, addUser, updateUser };
