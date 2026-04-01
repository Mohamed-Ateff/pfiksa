const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports",
    );

    console.log("Deleting all users except shahd@gmail.com...\n");

    // Delete all users except shahd@gmail.com
    const result = await User.deleteMany({ email: { $ne: "shahd@gmail.com" } });

    console.log(`✅ Deleted ${result.deletedCount} user(s)\n`);

    // Show remaining users
    const remaining = await User.find({}).select("name email role position");
    console.log("📋 Remaining users:\n");
    remaining.forEach((user, i) => {
      console.log(`${i + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}\n`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
