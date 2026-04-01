const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function exportData() {
  try {
    const User = require("./models/User");
    const Report = require("./models/Report");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports",
    );

    // Export all data
    const users = await User.find({});
    const reports = await Report.find({});

    const backup = {
      timestamp: new Date().toISOString(),
      users: users.map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        position: u.position,
      })),
      reportCount: reports.length,
    };

    // Save to file
    const exportPath = path.join(__dirname, "..", "DATA_BACKUP.json");
    fs.writeFileSync(exportPath, JSON.stringify(backup, null, 2));

    console.log("✅ Data exported to DATA_BACKUP.json");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Export error:", err.message);
  }
}

exportData();
