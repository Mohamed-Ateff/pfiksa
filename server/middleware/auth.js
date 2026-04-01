const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret",
    );
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isManager = (req, res, next) => {
  if (req.userRole !== "manager") {
    return res
      .status(403)
      .json({ message: "Access denied. Only managers allowed." });
  }
  next();
};

module.exports = { auth, isManager };
