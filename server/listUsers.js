const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports",
    );
    const users = await User.find({}).select("name email role position");

    console.log("\n📋 CURRENT USERS IN DATABASE:\n");

    if (users.length === 0) {
      console.log("❌ No users found. Database is empty.");
    } else {
      users.forEach((user, i) => {
        console.log(`${i + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Position: ${user.position}`);
        console.log("");
      });
      console.log(`\nTotal: ${users.length} user(s)`);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
