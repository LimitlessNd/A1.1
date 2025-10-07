// seedUsers.js
const { connectDB, getDb } = require('../app');

async function run() {
  await connectDB();
  const db = getDb();

  // Users to seed
  const users = [
    {
      username: "superAdmin",
      email: "super@test.com",
      password: "123",  // in production, hash passwords!
      roles: ["SUPER_ADMIN"],
      groups: ["68e34bc8a94dc75abe0788e1", "68e34ae52724b1c733f788d2"]
    },
    {
      username: "john",
      email: "john@example.com",
      password: "password",
      roles: ["USER"],
      groups: ["68e34bc8a94dc75abe0788e1", "68e34ae52724b1c733f788d2"]
    },
    {
      username: "jane",
      email: "jane@example.com",
      password: "password",
      roles: ["USER"],
       groups: ["68e34bc8a94dc75abe0788e1", "68e34ae52724b1c733f788d2"]
    }
  ];

  const result = await db.collection('users').insertMany(users);
  console.log(`Inserted ${result.insertedCount} users`);
  process.exit();
}

run();
