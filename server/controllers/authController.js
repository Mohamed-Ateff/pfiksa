const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const memoryDB = require("../memoryDB");

// Check if we're using memory database
let useMemoryDB = false;

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Try memory DB first if available
    let user = memoryDB.findUserByEmail(email);
    
    if (!user) {
      // Try MongoDB
      try {
        user = await User.findOne({ email });
      } catch (err) {
        useMemoryDB = true;
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    let isPasswordValid = false;
    if (useMemoryDB || !user.comparePassword) {
      // Direct comparison for memory DB
      isPasswordValid = password === user.password;
    } else {
      // Use bcrypt for MongoDB users
      isPasswordValid = await user.comparePassword(password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
