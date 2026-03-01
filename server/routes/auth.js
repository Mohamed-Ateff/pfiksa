const express = require("express");
const {
  createUser,
  login,
  getCurrentUser,
} = require("../controllers/authController");
const { auth, isManager } = require("../middleware/auth");

const router = express.Router();

router.post("/create-user", auth, isManager, createUser);
router.post("/login", login);
router.get("/me", auth, getCurrentUser);

module.exports = router;
