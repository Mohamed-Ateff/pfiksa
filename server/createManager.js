const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports";

async function run() {
  await mongoose.connect(MONGODB_URI);
  await User.deleteOne({ email: "shahd1@gmail.com" });
  const user = new User({
    name: "Shahd1",
    email: "shahd1@gmail.com",
    password: "Shahd$1",
    role: "manager",
    position: "Manager",
  });
  await user.save();
  console.log("Manager created: shahd1@gmail.com / Shahd$1");
  await mongoose.disconnect();
}

run().catch(console.error);
