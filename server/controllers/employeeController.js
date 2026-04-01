const memoryDB = require("../memoryDB");

// Get all employees (manager only)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = memoryDB
      .findAllUsers()
      .filter((u) => u.role === "employee")
      .map(({ password, ...rest }) => rest);

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const user = memoryDB.findUserById(Number(employeeId));

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const { password, ...employee } = user;
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

    if (Number(employeeId) !== req.userId && req.userRole !== "manager") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this employee" });
    }

    const updated = memoryDB.updateUser(Number(employeeId), { name, position });
    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const { password, ...employee } = updated;
    res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
