const mongoose = require("mongoose");
const User = require("./models/User");
const Report = require("./models/Report");
require("dotenv").config();

// Migrate from local to Atlas
async function migrateToAtlas() {
  const localUri = "mongodb://localhost:27017/employee-reports";
  const atlasUri = process.env.MONGODB_URI;

  console.log("🔄 Starting migration from local to Atlas...");

  try {
    // Connect to local DB
    const localConn = await mongoose.createConnection(localUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
    });

    console.log("✅ Connected to local MongoDB");

    // Get all data
    const LocalUser = localConn.model("User", User.schema);
    const LocalReport = localConn.model("Report", Report.schema);

    const users = await LocalUser.find({});
    const reports = await LocalReport.find({});

    console.log(`📊 Found ${users.length} users and ${reports.length} reports`);

    // Connect to Atlas
    const atlasConn = await mongoose.createConnection(atlasUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ Connected to MongoDB Atlas");

    // Clear Atlas data
    const AtlasUser = atlasConn.model("User", User.schema);
    const AtlasReport = atlasConn.model("Report", Report.schema);

    await AtlasUser.deleteMany({});
    await AtlasReport.deleteMany({});

    // Migrate users
    for (const user of users) {
      const newUser = new AtlasUser(user.toObject());
      await newUser.save();
    }

    // Migrate reports
    for (const report of reports) {
      const newReport = new AtlasReport(report.toObject());
      await newReport.save();
    }

    console.log("✅ Migration completed successfully!");
    console.log(`   Migrated: ${users.length} users, ${reports.length} reports`);

    await localConn.close();
    await atlasConn.close();

  } catch (err) {
    console.error("❌ Migration error:", err.message);
    console.log("⚠️  Migration failed, but continuing with Atlas setup");
  }
}

migrateToAtlas().then(() => {
  console.log("🎯 Migration process complete");
  process.exit(0);
}).catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
