const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);
require("dotenv").config();

const backupDir = path.join(__dirname, "backups");
const dataDir = path.join(__dirname, "..", "data-backups");

// Ensure backup directories exist
[backupDir, dataDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function createBackup() {
  try {
    const User = require("./models/User");
    const Report = require("./models/Report");

    // Use existing mongoose connection instead of creating new one
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected");
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);

    // Export data as JSON
    const users = await User.find({});
    const reports = await Report.find({});

    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        users: users.map((u) => u.toObject()),
        reports: reports.map((r) => r.toObject()),
      },
      stats: {
        userCount: users.length,
        reportCount: reports.length,
      },
    };

    // Save JSON backup
    const jsonPath = path.join(dataDir, `backup-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(backup, null, 2));
    console.log(`✅ JSON Backup created: ${jsonPath}`);

    // Create MongoDB dump
    try {
      const dumpPath = path.join(backupDir, `dump-${timestamp}`);
      await execAsync(`mongodump --db employee-reports --out "${dumpPath}"`);
      console.log(`✅ MongoDB dump created: ${dumpPath}`);
    } catch (err) {
      console.warn("⚠️  MongoDB dump not available (mongodump not installed)");
    }

    // Clean old backups (keep last 30)
    cleanOldBackups(dataDir, 30);
    cleanOldBackups(backupDir, 30);

    return backup;
  } catch (err) {
    console.error("❌ Backup error:", err.message);
    throw err;
  }
}

async function restoreBackup(backupFile) {
  try {
    console.log(`🔄 Restoring from: ${backupFile}`);

    const backupData = JSON.parse(fs.readFileSync(backupFile, "utf8"));

    // Use existing mongoose connection instead of creating new one
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected");
    }

    const User = require("./models/User");
    const Report = require("./models/Report");

    // Clear existing data
    await User.deleteMany({});
    await Report.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Restore users
    for (const userData of backupData.data.users) {
      const user = new User(userData);
      await user.save();
    }
    console.log(`✅ Restored ${backupData.data.users.length} users`);

    // Restore reports
    for (const reportData of backupData.data.reports) {
      const report = new Report(reportData);
      await report.save();
    }
    console.log(`✅ Restored ${backupData.data.reports.length} reports`);

    return backupData.stats;
  } catch (err) {
    console.error("❌ Restore error:", err.message);
    throw err;
  }
}

function cleanOldBackups(dir, keepCount) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("backup-") || f.startsWith("dump-"))
    .sort()
    .reverse();

  if (files.length > keepCount) {
    const toDelete = files.slice(keepCount);
    toDelete.forEach((file) => {
      const filePath = path.join(dir, file);
      try {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`🗑️  Deleted old backup: ${file}`);
      } catch (err) {
        console.warn(`Could not delete ${file}`);
      }
    });
  }
}

// Export for CLI usage
module.exports = { createBackup, restoreBackup, cleanOldBackups };

// If run directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === "create") {
    createBackup()
      .then(() => console.log("✅ Backup complete"))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  } else if (command === "restore" && process.argv[3]) {
    restoreBackup(process.argv[3])
      .then((stats) => {
        console.log("✅ Restore complete", stats);
        process.exit(0);
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  } else {
    console.log("Usage:");
    console.log("  npm run backup:create          - Create backup");
    console.log("  npm run backup:restore <file>  - Restore from backup");
    process.exit(1);
  }
}
