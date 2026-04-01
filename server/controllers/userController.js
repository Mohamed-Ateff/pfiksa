const memoryDB = require("../memoryDB");

// Get all users (manager only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = memoryDB
      .findAllUsers()
      .map(({ password, ...rest }) => rest)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (manager only)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (Number(userId) === req.userId) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = memoryDB.findUserById(Number(userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    memoryDB.deleteUser(user.email);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile (manager only)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, position } = req.body;

    const updated = memoryDB.updateUser(Number(userId), {
      name,
      email,
      role,
      position,
    });
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...user } = updated;
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset user password (manager only)
exports.updateUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters" });
    }

    const user = memoryDB.findUserById(Number(userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    memoryDB.updateUser(Number(userId), { password });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
