const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test users to create
    const testUsers = [
      {
        name: "Shahd",
        email: "shahd@gmail.com",
        password: "Shahd$",
        role: "manager",
        position: "Manager",
      },
      {
        name: "Shahd One",
        email: "shahd1@gmail.com",
        password: "Shahd$1",
        role: "employee",
        position: "Developer",
      },
      {
        name: "John Doe",
        email: "john@gmail.com",
        password: "John123456",
        role: "employee",
        position: "Designer",
      },
      {
        name: "Jane Smith",
        email: "jane@gmail.com",
        password: "Jane123456",
        role: "employee",
        position: "Project Manager",
      },
    ];

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create new users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created: ${userData.email} / ${userData.password}`);
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("\nTest Accounts:");
    testUsers.forEach(user => {
      console.log(`  📧 ${user.email} | 🔑 ${user.password} | 👤 ${user.role}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
}

seed();
