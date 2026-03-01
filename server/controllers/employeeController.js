const User = require("../models/User");

// Get all employees (manager only)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await User.findById(employeeId).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update employee info (manager or self)
exports.updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, position } = req.body;

    if (employeeId !== req.userId.toString() && req.userRole !== "manager") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this employee" });
    }

    const employee = await User.findByIdAndUpdate(
      employeeId,
      { name, position },
      { new: true },
    ).select("-password");

    res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
