const memoryDB = require("../memoryDB");

// Helper: populate report with employee and checker info
function populateReport(report) {
  const employee = memoryDB.findUserById(report.employeeId);
  const checker = report.checkedBy ? memoryDB.findUserById(report.checkedBy) : null;
  return {
    ...report,
    employeeId: employee
      ? { _id: employee._id, name: employee.name, email: employee.email, position: employee.position }
      : report.employeeId,
    checkedBy: checker
      ? { _id: checker._id, name: checker.name, email: checker.email }
      : null,
  };
}

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { completedTasks, inProgressTasks, commitments, challenges } = req.body;

    const report = memoryDB.createReport({
      employeeId: req.userId,
      completedTasks: completedTasks || "",
      inProgressTasks: inProgressTasks || "",
      commitments: commitments || "",
      challenges: challenges || "",
      files: req.files
        ? req.files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            path: `/uploads/${file.filename}`,
          }))
        : [],
      isChecked: false,
      checkedBy: null,
      checkedAt: null,
      approvalNotes: "",
    });

    res.status(201).json({
      message: "Report created successfully",
      report: populateReport(report),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reports (manager only)
exports.getAllReports = async (req, res) => {
  try {
    const reports = memoryDB
      .findAllReports()
      .map(populateReport)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee's own reports
exports.getMyReports = async (req, res) => {
  try {
    const reports = memoryDB
      .findReportsByEmployee(req.userId)
      .map(populateReport)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update report status (manager only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { isChecked, approvalNotes } = req.body;

    const report = memoryDB.updateReport(Number(reportId), {
      isChecked,
      checkedBy: isChecked ? req.userId : null,
      checkedAt: isChecked ? new Date() : null,
      approvalNotes: isChecked ? approvalNotes || "" : "",
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      message: "Report status updated",
      report: populateReport(report),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reports for a specific date
exports.getReportsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const reports = memoryDB
      .findAllReports()
      .filter((r) => {
        const created = new Date(r.createdAt);
        return created >= startDate && created <= endDate;
      })
      .map(populateReport)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = memoryDB.findAllReports().find((r) => r._id === Number(reportId));

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.employeeId !== req.userId && req.userRole !== "manager") {
      return res.status(403).json({ message: "Not authorized to delete this report" });
    }

    memoryDB.deleteReport(Number(reportId));
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
