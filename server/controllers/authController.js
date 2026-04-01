const jwt = require("jsonwebtoken");
const memoryDB = require("../memoryDB");

// Login - use ONLY memory database
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user in memory DB only
    const user = memoryDB.findUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password directly (memory DB stores plain text)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
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
    const user = memoryDB.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user - for manager creating new employees
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, position, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const existingUser = memoryDB.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = memoryDB.createUser({
      name,
      email,
      password,
      position: position || "Employee",
      role: role || "employee",
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        position: newUser.position,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
