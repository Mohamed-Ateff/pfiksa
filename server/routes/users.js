const express = require("express");
const {
  getAllUsers,
  deleteUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");
const { auth, isManager } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, isManager, getAllUsers);
router.put("/:userId", auth, isManager, updateUser);
router.put("/:userId/password", auth, isManager, updateUserPassword);
router.delete("/:userId", auth, isManager, deleteUser);

module.exports = router;
