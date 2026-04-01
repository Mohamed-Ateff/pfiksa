const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

// Old Railway MongoDB URI
const OLD_MONGODB_URI =
  "mongodb://mongo:iavavQpzCnuqLhBaYIDNbGlYCMLusjPF@tramway.proxy.rlwy.net:12820/employee-reports";
const NEW_MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports";

async function recoverData() {
  let oldConnection;
  let newConnection;

  try {
    console.log("🔄 Attempting to recover data from Railway database...");

    // Connect to old database
    oldConnection = await mongoose
      .createConnection(OLD_MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 5000,
      })
      .asPromise();

    console.log("✅ Connected to old Railway database");

    // Get users from old database
    const OldUser = oldConnection.model(
      "User",
      require("./models/User").schema,
    );
    const oldUsers = await OldUser.find({});
    console.log(`📊 Found ${oldUsers.length} users in old database`);

    // Connect to new database
    newConnection = await mongoose
      .createConnection(NEW_MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 5000,
      })
      .asPromise();

    console.log("✅ Connected to new local database");

    // Copy users to new database
    const NewUser = newConnection.model(
      "User",
      require("./models/User").schema,
    );

    for (const user of oldUsers) {
      const exists = await NewUser.findOne({ email: user.email });
      if (!exists) {
        const newUser = new NewUser({
          name: user.name,
          email: user.email,
          password: user.password, // Already hashed
          role: user.role,
          position: user.position,
          createdAt: user.createdAt,
        });
        await newUser.save();
        console.log(`✅ Migrated: ${user.email}`);
      } else {
        console.log(`⏭️  Skipped (exists): ${user.email}`);
      }
    }

    console.log("\n✅ Data recovery complete!");
  } catch (err) {
    console.error("❌ Recovery error:", err.message);
    console.log(
      "\n⚠️ Note: The old Railway database may be offline or unreachable.",
    );
    console.log(
      "This is normal. The lost accounts will need to be recreated or added manually.",
    );
  } finally {
    if (oldConnection) await oldConnection.close();
    if (newConnection) await newConnection.close();
    process.exit(0);
  }
}

recoverData();
