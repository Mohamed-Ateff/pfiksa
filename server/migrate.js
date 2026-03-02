const mongoose = require("mongoose");
const User = require("./models/User");
const Report = require("./models/Report");

const LOCAL = "mongodb://localhost:27017/employee-reports";
const RAILWAY =
  "mongodb://mongo:iavavQpzCnuqLhBaYIDNbGlYCMLusjPF@tramway.proxy.rlwy.net:12820";

async function migrate() {
  console.log("Connecting to local MongoDB...");
  const localConn = await mongoose.createConnection(LOCAL).asPromise();

  console.log("Connecting to Railway MongoDB...");
  const railwayConn = await mongoose.createConnection(RAILWAY).asPromise();

  const LocalUser = localConn.model("User", User.schema);
  const LocalReport = localConn.model("Report", Report.schema);
  const RailwayUser = railwayConn.model("User", User.schema);
  const RailwayReport = railwayConn.model("Report", Report.schema);

  // Migrate users
  const users = await LocalUser.find().select("+password").lean();
  console.log(`Found ${users.length} users locally`);
  if (users.length > 0) {
    await RailwayUser.deleteMany({});
    // Insert raw docs bypassing mongoose validation (passwords already hashed)
    await railwayConn.collection("users").deleteMany({});
    await railwayConn.collection("users").insertMany(users);
    console.log(`✅ Migrated ${users.length} users`);
  }

  // Migrate reports
  const reports = await LocalReport.find().lean();
  console.log(`Found ${reports.length} reports locally`);
  if (reports.length > 0) {
    await railwayConn.collection("reports").deleteMany({});
    await railwayConn.collection("reports").insertMany(reports);
    console.log(`✅ Migrated ${reports.length} reports`);
  }

  await localConn.close();
  await railwayConn.close();
  console.log(
    "✅ Migration complete! Railway DB is now in sync with your local DB.",
  );
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
