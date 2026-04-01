const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const backupDir = path.join(__dirname, "backups");

// Create backups folder if doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Create timestamped backup
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDir, `backup-${timestamp}`);

try {
  console.log("📦 Creating database backup...");
  execSync(`mongodump --db employee-reports --out "${backupPath}"`, {
    stdio: "inherit",
  });
  console.log(`✅ Backup created: ${backupPath}`);

  // Keep only last 7 backups (delete older ones)
  const files = fs.readdirSync(backupDir).sort().reverse();
  if (files.length > 7) {
    const toDelete = files.slice(7);
    toDelete.forEach((file) => {
      const deletePath = path.join(backupDir, file);
      fs.rmSync(deletePath, { recursive: true });
      console.log(`🗑️  Deleted old backup: ${file}`);
    });
  }
} catch (err) {
  console.error("❌ Backup failed:", err.message);
}
