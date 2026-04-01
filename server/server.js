const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection - use in-memory database for stability (Production-Ready)
let mongoServer;
const connectDB = async () => {
  try {
    console.log(
      `[${new Date().toLocaleTimeString()}] Starting MongoDB Memory Server...`,
    );

    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    console.log(
      `[${new Date().toLocaleTimeString()}] Connecting to in-memory MongoDB...`,
    );
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Memory Server connected successfully");

    // Add connection event listeners
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempts to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    // Seed initial data if in development and empty
    if (process.env.NODE_ENV === "development") {
      await seedInitialData();
    }

    return true; // Success
  } catch (err) {
    console.error(`❌ Failed to start MongoDB Memory Server: ${err.message}`);
    return false; // Failed
  }
};

// Seed initial data
const seedInitialData = async () => {
  try {
    const User = require("./models/User");
    const count = await User.countDocuments();

    if (count === 0) {
      console.log("📊 Seeding initial test users...");
      const testUsers = [
        {
          name: "Shahd",
          email: "shahd@gmail.com",
          password: "Shahd$",
          role: "manager",
          position: "Manager",
        },
        {
          name: "Shahd One",
          email: "shahd1@gmail.com",
          password: "Shahd$1",
          role: "employee",
          position: "Developer",
        },
        {
          name: "John Doe",
          email: "john@gmail.com",
          password: "John123456",
          role: "employee",
          position: "Designer",
        },
        {
          name: "Jane Smith",
          email: "jane@gmail.com",
          password: "Jane123456",
          role: "employee",
          position: "Project Manager",
        },
      ];

      for (const userData of testUsers) {
        const user = new User(userData);
        await user.save();
      }
      console.log("✅ Test users created:");
      testUsers.forEach((u) =>
        console.log(`   📧 ${u.email} | 🔑 ${u.password}`),
      );
    }
  } catch (err) {
    console.error("Seeding error:", err.message);
  }
};

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/users", require("./routes/users"));

// One-time setup endpoint — creates initial manager only if none exists
app.get("/api/setup", async (req, res) => {
  try {
    const User = require("./models/User");
    const existing = await User.findOne({ role: "manager" });
    if (existing) {
      return res.json({
        message: "Setup already done. Manager already exists.",
      });
    }
    const user = new User({
      name: "Shahd",
      email: "shahd@gmail.com",
      password: "Shahd$",
      role: "manager",
      position: "Manager",
    });
    await user.save();
    res.json({ message: "✅ Manager created: shahd@gmail.com / Shahd$" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ message: "Employee-Manager Reporting System API" });
  });
}

connectDB().then((connected) => {
  if (connected) {
    console.log("✅ Database connected, starting server...");

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("🛑 Received SIGINT, shutting down gracefully...");
      if (mongoServer) {
        await mongoServer.stop();
        console.log("✅ MongoDB Memory Server stopped");
      }
      await mongoose.connection.close();
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    // Setup auto-backup
    const setupAutoBackup = async () => {
      try {
        const { createBackup } = require("./backupManager");

        // Backup on startup
        console.log("💾 Creating startup backup...");
        await createBackup();

        // Backup every 12 hours
        setInterval(
          async () => {
            try {
              console.log("💾 Running scheduled backup...");
              await createBackup();
            } catch (err) {
              console.error("Scheduled backup error:", err.message);
            }
          },
          12 * 60 * 60 * 1000,
        ); // 12 hours

        console.log("✅ Automatic backup system activated (every 12 hours)");
      } catch (err) {
        console.warn("⚠️  Backup system not available:", err.message);
      }
    };

    setTimeout(setupAutoBackup, 2000);
  } else {
    console.error("❌ Failed to connect to database. Server not starting.");
    process.exit(1);
  }
});
