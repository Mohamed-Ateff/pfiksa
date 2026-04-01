const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

// Import memory database (pure JS, no external dependencies)
const memoryDB = require("./memoryDB");
let useMemoryDB = true; // Default to memory DB on Render

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection - use memory DB only
const connectDB = async () => {
  try {
    console.log(`[${new Date().toLocaleTimeString()}] Starting database...`);
    
    // Just use memory DB - it's pure JavaScript, works everywhere
    console.log("✅ Using in-memory database (zero dependencies)");
    
    // Seed initial data
    await seedInitialData();
    
    return true;
  } catch (err) {
    console.error(`❌ Database error: ${err.message}`);
    return false;
  }
};

// Seed initial data
const seedInitialData = async () => {
  try {
    if (useMemoryDB) {
      // Seed memory database
      const testUsers = [
        {
          email: "shahd@gmail.com",
          password: "Shahd$",
          name: "Shahd",
          role: "manager",
          position: "Manager",
// Seed initial data - memory DB only
const seedInitialData = async () => {
  try {
    const testUsers = [
      {
        email: "shahd@gmail.com",
        password: "Shahd$",
        name: "Shahd",
        role: "manager",
        position: "Manager",
      },
      {
        email: "shahd1@gmail.com",
        password: "Shahd$1",
        name: "Shahd One",
        role: "employee",
        position: "Developer",
      },
      {
        email: "john@gmail.com",
        password: "John123456",
        name: "John Doe",
        role: "employee",
        position: "Designer",
      },
      {
        email: "jane@gmail.com",
        password: "Jane123456",
        name: "Jane Smith",
        role: "employee",
        position: "Project Manager",
      },
    ];

    const existingUser = memoryDB.findUserByEmail("shahd@gmail.com");
    if (!existingUser) {
      for (const userData of testUsers) {
        memoryDB.createUser(userData);
      }
      console.log("✅ Test users created:");
      testUsers.forEach((u) =>
        console.log(`   📧 ${u.email} | 🔑 ${u.password}`),
      );
    } else {
      console.log("✅ Database already initialized");
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
    const existing = memoryDB.findUserByEmail("shahd@gmail.com");
    if (existing) {
      return res.json({
        message: "Setup already done. Manager already exists.",
      });
    }
    const user = memoryDB.createUser({
      name: "Shahd",
      email: "shahd@gmail.com",
      password: "Shahd$",
      role: "manager",
      position: "Manager",
    });
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
