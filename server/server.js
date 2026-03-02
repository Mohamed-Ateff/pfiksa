const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/employee-reports",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
