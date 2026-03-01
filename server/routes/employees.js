const express = require("express");
const {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
} = require("../controllers/employeeController");
const { auth, isManager } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, isManager, getAllEmployees);
router.get("/:employeeId", auth, getEmployeeById);
router.put("/:employeeId", auth, updateEmployee);

module.exports = router;
