const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const email = "shahd@gmail.com";

  // Remove existing user with this email (so we can re-seed cleanly)
  await User.deleteOne({ email });

  const user = new User({
    name: "Shahd",
    email,
    password: "Shahd$",
    role: "manager",
    position: "Manager",
  });

  await user.save();
  console.log("✅ Created manager: shahd@gmail.com / Shahd$");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
