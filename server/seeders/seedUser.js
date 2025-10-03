// seedUsers.js
const { connectDB, getDb } = require('../app');

async function run() {
  await connectDB();
  const db = getDb();

  // Users to seed
  const users = [
    {
      _id: "1",
      username: "superAdmin",
      email: "super@test.com",
      password: "123",  // in production, hash passwords!
      roles: ["SUPER_ADMIN"],
      groups: ["group1"]
    },
    {
      _id: "2",
      username: "john",
      email: "john@example.com",
      password: "password",
      roles: ["USER"],
      groups: ["group1", "group2"]
    },
    {
      _id: "3",
      username: "jane",
      email: "jane@example.com",
      password: "password",
      roles: ["USER"],
      groups: ["group2"]
    }
  ];

  const result = await db.collection('users').insertMany(users);
  console.log(`Inserted ${result.insertedCount} users`);
  process.exit();
}

run();
