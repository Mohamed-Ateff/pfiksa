const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports";

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to:", MONGODB_URI);

  const user = await User.findOne({ email: "shahd1@gmail.com" }).select("+password");
  if (!user) { console.log("User NOT found!"); return mongoose.disconnect(); }

  console.log("User found:", user.name, user.email, user.role);
  const match = await user.matchPassword("Shahd$1");
  console.log("Password match:", match);

  await mongoose.disconnect();
}

run().catch(console.error);
