// seedGroups.js
const { connectDB, getDb } = require('../app');

async function run() {
  try {
    // Connect to DB
    await connectDB();
    const db = getDb();

    // Groups to seed
    const groups = [
      {
        name: "General Chat",
        groupAdmins: ["2"], // john as admin
        members: ["1", "2"], // superAdmin and john
        channels: [
          { id: "c1", name: "General", description: "General discussion" },
          { id: "c2", name: "Random", description: "Random topics" },
          { id: "c3", name: "Announcements", description: "Important announcements" }
        ]
      },
      {
        name: "Project Team",
        groupAdmins: ["2"], // john as admin
        members: ["2", "3"], // john and jane
        channels: [
          { id: "c1", name: "Project Updates", description: "Updates on the project" },
          { id: "c2", name: "Resources", description: "Shared files and links" }
        ]
      }
    ];

    // Insert groups
    const result = await db.collection('groups').insertMany(groups);
    console.log(`Inserted ${result.insertedCount} groups`);

    process.exit();
  } catch (err) {
    console.error("Error seeding groups:", err);
    process.exit(1);
  }
}

run();
